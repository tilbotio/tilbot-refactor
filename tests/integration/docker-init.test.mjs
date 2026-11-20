import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, rmdirSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const id = randomUUID();
const image = `tilbot-init-test-${id}`;
const volumes = [];
let fixture;
let projects;
let publicProjects;
let secret;
let privateVolume;
let publicVolume;
let secretVolume;

function docker(args) {
  const result = spawnSync("docker", args, { cwd: root, encoding: "utf8" });
  if (result.error) throw result.error;
  return result;
}

function success(args) {
  const result = docker(args);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result;
}

function volume() {
  const name = `tilbot-init-test-${randomUUID()}`;
  success(["volume", "create", name]);
  volumes.push(name);
  return name;
}

function mount(source, target, type = "volume", readOnly = false) {
  return `type=${type},source=${source},target=${target}${readOnly ? ",readonly" : ""}`;
}

function initialize(privateData, publicData, secretFile = secret) {
  return docker([
    "run", "--rm", "--network", "none",
    "--mount", mount(projects, "/legacy/projects", "bind", true),
    "--mount", mount(publicProjects, "/legacy/proj_pub", "bind", true),
    "--mount", mount(secretFile, "/run/secrets/initial_admin_password", "bind", true),
    "--mount", mount(privateData, "/data/projects"),
    "--mount", mount(publicData, "/data/proj_pub"),
    "--mount", mount(secretVolume, "/run/private"),
    image,
  ]);
}

function nodeInVolumes(user, privateData, publicData, script) {
  return docker([
    "run", "--rm", "--network", "none", "--user", user, "--entrypoint", "node",
    "--mount", mount(privateData, "/data/projects"),
    "--mount", mount(publicData, "/data/proj_pub"),
    "--mount", mount(secretVolume, "/run/private", "volume", true),
    image, "-e", script,
  ]);
}

before(() => {
  fixture = mkdtempSync(path.join(tmpdir(), "tilbot-init-test-"));
  projects = path.join(fixture, "projects");
  publicProjects = path.join(fixture, "public");
  secret = path.join(fixture, "password");
  mkdirSync(projects);
  mkdirSync(publicProjects);
  writeFileSync(path.join(projects, "private.txt"), "original");
  writeFileSync(path.join(publicProjects, "public.txt"), "public");
  writeFileSync(secret, randomUUID());
  success(["build", "--target", "backend-init", "-t", image, "."]);
  privateVolume = volume();
  publicVolume = volume();
  secretVolume = volume();
});

after(() => {
  for (const name of volumes) success(["volume", "rm", name]);
  if (image) success(["image", "rm", image]);
  if (fixture) {
    unlinkSync(path.join(projects, "private.txt"));
    unlinkSync(path.join(publicProjects, "public.txt"));
    unlinkSync(secret);
    rmdirSync(projects);
    rmdirSync(publicProjects);
    rmdirSync(fixture);
  }
});

test("migrates once, preserves the host backup, and restricts the secret", () => {
  const first = initialize(privateVolume, publicVolume);
  assert.equal(first.status, 0, first.stderr);
  const probe = nodeInVolumes("1000:1000", privateVolume, publicVolume, `
    const fs = require('node:fs');
    const assert = require('node:assert/strict');
    assert.equal(fs.readFileSync('/data/projects/private.txt', 'utf8'), 'original');
    assert.equal(fs.readFileSync('/data/proj_pub/public.txt', 'utf8'), 'public');
    assert.equal(fs.statSync('/data/projects').mode & 0o777, 0o700);
    assert.equal(fs.statSync('/data/proj_pub').mode & 0o777, 0o700);
    assert.equal(fs.statSync('/run/private').mode & 0o777, 0o700);
    assert.equal(fs.statSync('/run/private/initial_admin_password').mode & 0o777, 0o400);
    fs.accessSync('/run/private/initial_admin_password');
    fs.writeFileSync('/data/projects/private.txt', 'live-change');
  `);
  assert.equal(probe.status, 0, probe.stderr);
  const denied = nodeInVolumes("65534:65534", privateVolume, publicVolume, `
    try { require('node:fs').accessSync('/run/private/initial_admin_password'); process.exit(1); }
    catch (error) { if (error.code !== 'EACCES') process.exit(2); }
  `);
  assert.equal(denied.status, 0, denied.stderr);
  assert.equal(readFileSync(path.join(projects, "private.txt"), "utf8"), "original");

  writeFileSync(path.join(projects, "private.txt"), "host-change");
  const again = initialize(privateVolume, publicVolume);
  assert.equal(again.status, 0, again.stderr);
  const unchanged = nodeInVolumes("1000:1000", privateVolume, publicVolume, `
    if (require('node:fs').readFileSync('/data/projects/private.txt', 'utf8') !== 'live-change') process.exit(1);
  `);
  assert.equal(unchanged.status, 0, unchanged.stderr);
});

test("refuses a missing project volume instead of restoring stale host files", () => {
  const result = initialize(privateVolume, volume());
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /missing its migration state/);
});

test("refuses an unmarked non-empty project volume", () => {
  const occupied = volume();
  const seed = nodeInVolumes("0:0", occupied, volume(), `
    require('node:fs').writeFileSync('/data/projects/existing.txt', 'existing');
  `);
  assert.equal(seed.status, 0, seed.stderr);
  const result = initialize(occupied, volume());
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /not empty and has no migration marker/);
});

test("resumes an interrupted migration", () => {
  const privateData = volume();
  const publicData = volume();
  const seed = nodeInVolumes("0:0", privateData, publicData, `
    const fs = require('node:fs');
    fs.writeFileSync('/data/projects/.tilbot-storage-migrating', '');
    fs.writeFileSync('/data/proj_pub/.tilbot-storage-migrating', '');
    fs.writeFileSync('/data/projects/private.txt', 'incomplete');
  `);
  assert.equal(seed.status, 0, seed.stderr);
  const result = initialize(privateData, publicData);
  assert.equal(result.status, 0, result.stderr);
  const probe = nodeInVolumes("1000:1000", privateData, publicData, `
    const fs = require('node:fs');
    const assert = require('node:assert/strict');
    assert.equal(fs.readFileSync('/data/projects/private.txt', 'utf8'), 'host-change');
    assert.ok(fs.existsSync('/data/projects/.tilbot-storage-ready'));
    assert.ok(fs.existsSync('/data/proj_pub/.tilbot-storage-ready'));
  `);
  assert.equal(probe.status, 0, probe.stderr);
});

test("rejects an administrator secret that is a directory", () => {
  const result = initialize(volume(), volume(), projects);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /must be a readable file/);
});
