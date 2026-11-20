import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { UserModel } from "../../../backend/db/user.ts";

const username = `password-test-${randomUUID()}`;

before(async () => {
  await mongoose.connect(process.env.MONGO_DB ?? "mongodb://127.0.0.1:27017/tilbot");
});

after(async () => {
  await UserModel.deleteMany({ username });
  await mongoose.disconnect();
});

test("hashes new passwords, supports existing bcrypt hashes and checks the old password", async () => {
  const user = await UserModel.register(username, "original", 1);
  assert.notEqual(user.password, "original");
  assert.equal(await user.verifyPassword("original"), true);

  const hash = user.password;
  user.active = false;
  await user.save();
  assert.equal(user.password, hash);

  await assert.rejects(user.updatePassword("incorrect", "changed"));
  assert.equal(await user.verifyPassword("original"), true);
  await user.updatePassword("original", "changed");
  assert.equal(await user.verifyPassword("changed"), true);
  assert.equal(await user.verifyPassword("original"), false);

  const legacyHash = await bcrypt.hash("legacy", 10);
  await UserModel.collection.updateOne({ username }, { $set: { password: legacyHash } });
  const reloaded = await UserModel.findOne({ username });
  assert.ok(reloaded);
  assert.equal(await reloaded.verifyPassword("legacy"), true);
});
