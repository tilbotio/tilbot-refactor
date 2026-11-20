import MongoStore from "connect-mongo";
import type { SessionData } from "express-session";

export class SessionStore extends MongoStore {
  compareAndSet(
    id: string,
    expectedGeneration: string,
    session: SessionData,
    callback: (error: Error | null) => void,
  ): void {
    const generation = "session.__fastifySessionMetadata.generation";
    const generationFilter = expectedGeneration === id
      ? { $or: [{ [generation]: expectedGeneration }, { [generation]: null }] }
      : { [generation]: expectedGeneration };
    const cookie = "toJSON" in session.cookie && typeof session.cookie.toJSON === "function"
      ? session.cookie.toJSON()
      : session.cookie;
    const expires = cookie.expires
      ? new Date(cookie.expires)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    this.collectionP
      .then((collection) => collection.updateOne(
        {
          _id: id,
          $and: [
            generationFilter,
            { $or: [{ expires: { $exists: false } }, { expires: { $gt: new Date() } }] },
          ],
        },
        { $set: { session: { ...session, cookie }, expires } },
      ))
      .then((result) => {
        if (result.matchedCount === 0) {
          callback(Object.assign(new Error("Session no longer exists or has changed"), { code: "ENOENT" }));
          return;
        }
        this.emit("update", id);
        this.emit("set", id);
        callback(null);
      }, (error: unknown) => callback(error instanceof Error ? error : new Error(String(error))));
  }
}
