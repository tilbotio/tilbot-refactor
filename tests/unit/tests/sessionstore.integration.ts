import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { randomUUID } from "node:crypto";
import { MongoClient } from "mongodb";
import expressSession from "express-session";
import { SessionStore } from "../../../backend/sessionstore.ts";

const client = new MongoClient(process.env.MONGO_DB ?? "mongodb://127.0.0.1:27017/tilbot");
let store: SessionStore;

before(async () => {
  await client.connect();
  store = new SessionStore({
    client,
    collectionName: `session-test-${randomUUID()}`,
    stringify: false,
    autoRemove: "disabled",
  });
});

after(async () => {
  await (await store.collectionP).drop();
  await client.close();
});

function data(generation?: string) {
  return {
    cookie: new expressSession.Cookie({ maxAge: 60_000 }),
    ...(generation === undefined ? {} : { __fastifySessionMetadata: { generation } }),
  };
}

function set(id: string, generation?: string) {
  return new Promise<void>((resolve, reject) => {
    store.set(id, data(generation), (error) => error ? reject(error) : resolve());
  });
}

function compareAndSet(id: string, expectedGeneration: string, nextGeneration: string) {
  return new Promise<void>((resolve, reject) => {
    store.compareAndSet(id, expectedGeneration, data(nextGeneration), (error) =>
      error ? reject(error) : resolve(),
    );
  });
}

test("updates a matching session and rejects stale or deleted sessions", async () => {
  await set("current", "generation-1");
  await compareAndSet("current", "generation-1", "generation-2");
  await assert.rejects(compareAndSet("current", "generation-1", "generation-3"), { code: "ENOENT" });
  await assert.rejects(compareAndSet("missing", "missing", "generation-1"), { code: "ENOENT" });
  const saved = await (await store.collectionP).findOne({ _id: "current" });
  assert.ok(saved && typeof saved.session !== "string");
  assert.deepEqual(
    Object.getOwnPropertyDescriptor(saved.session, "__fastifySessionMetadata")?.value,
    { generation: "generation-2" },
  );
});

test("accepts legacy sessions but does not revive expired sessions", async () => {
  await set("legacy");
  await compareAndSet("legacy", "legacy", "generation-1");
  await set("expired", "generation-1");
  await (await store.collectionP).updateOne({ _id: "expired" }, { $set: { expires: new Date(0) } });
  await assert.rejects(compareAndSet("expired", "generation-1", "generation-2"), { code: "ENOENT" });
});
