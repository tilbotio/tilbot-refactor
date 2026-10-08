import mongoose from "mongoose";
import { LogModel } from "./db/log.ts";
import { MessageModel } from "./db/message.ts";
import type { ProjectControllerLoggerInterface } from "../common/projectcontroller/types.ts";

// The browser's audio container isn't preserved in the blob type, so detect it.
function audioExtension(data: Buffer): string {
  const head = data.subarray(0, 12);
  if (head.subarray(0, 4).toString("latin1") === "OggS") return "ogg";
  if (head.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) return "webm";
  if (head.subarray(0, 4).toString("latin1") === "RIFF") return "wav";
  if (head.subarray(4, 8).toString("latin1") === "ftyp") return "m4a";
  return "bin";
}

export class Logger implements ProjectControllerLoggerInterface {
  private _log: any;
  private _saveQueue: Promise<void> = Promise.resolve();

  constructor(project_id: string) {
    this._log = new LogModel();
    this._log.project_id = project_id;
    this._log.session_started = new Date();

    const packageVersion = (globalThis as {
        process?: { env?: Record<string, string | undefined> }
    }).process?.env?.npm_package_version;

    this._log.version = packageVersion || 'unknown';
    
    void this._enqueueSave(() => {}, "initial_save").catch(() => {});
  }

  private _enqueueSave(update: () => void, event: string): Promise<void> {
    const save = this._saveQueue.then(async () => {
      update();
      await this._log.save();
    });
    this._saveQueue = save.catch((err: any) => {
      console.error(`Logging error ${event}`, err);
    });
    return save;
  }

  log(event: string, detail = "") {
    console.log("Loggging event: " + event + " detail: " + detail);
    if (event == "message_bot" || event == "message_user") {
      const msg = new MessageModel();
      msg.source = "bot";
      if (event == "message_user") {
        msg.source = "user";
      }
      msg.message = detail;
      void this._enqueueSave(
        () => this._log.messages.push(msg),
        "message",
      ).catch(() => {});
    } else if (event == "session_end") {
      void this._enqueueSave(
        () => (this._log.session_closed = new Date()),
        event,
      ).catch(() => {});
    }
  }

  set_participant_id(pid: string) {
    void this._enqueueSave(
      () => (this._log.participant_id = pid),
      "participant_id",
    ).catch(() => {});
  }

  private _findAudioMessage(fileId: mongoose.Types.ObjectId): any {
    return this._log.messages.find(
      (m: any) => m.audio_file_id && m.audio_file_id.equals(fileId),
    );
  }

  async log_audio(audio: Blob): Promise<void> {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Cannot log audio: MongoDB is not connected");
    }

    // Reserve the message's position in the log right away, so it stays in
    // order with the bot messages while the upload is still running.
    const fileId = new mongoose.Types.ObjectId();
    const message = new MessageModel({
      source: "user",
      message: `audio/${fileId}`,
      audio_file_id: fileId,
    });
    void this._enqueueSave(
      () => this._log.messages.push(message),
      "audio_message",
    ).catch(() => {});

    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: "audio_logs",
    });
    try {
      const contents = Buffer.from(await audio.arrayBuffer());
      const upload = bucket.openUploadStreamWithId(
        fileId,
        `audio-${Date.now()}`,
        {
          metadata: {
            contentType: audio.type || "application/octet-stream",
            projectId: this._log.project_id,
            logId: this._log._id,
          },
        },
      );
      await new Promise<void>((resolve, reject) => {
        upload.once("error", reject);
        upload.once("finish", resolve);
        upload.end(contents);
      });

      await this._enqueueSave(() => {
        this._findAudioMessage(fileId).message = `audio/${fileId}.${audioExtension(contents)}`;
      }, "audio_message_ext");
    } catch (error) {
      try {
        await bucket.delete(fileId);
      } catch {
        // nothing was uploaded
      }
      await this._enqueueSave(() => {
        const saved = this._findAudioMessage(fileId);
        saved.message = "audio (upload failed)";
        saved.audio_file_id = undefined;
      }, "audio_message_failed").catch(() => {});
      throw error;
    }
  }
}