import { test, expect } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { connect } from "node:net";
import { connect as connectTls } from "node:tls";

test("routes API, project files and WebSocket requests to the backend", async ({ request }) => {
  const address = process.env.FRONTEND_ADDRESS || "localhost";
  const scheme = process.env.FRONTEND_SCHEME || "http";
  const base = `${scheme}://${address}:5173`;

  if (scheme === "https") {
    const plaintext = await request.get(`http://${address}:5173/healthcheck`);
    expect(plaintext.status()).toBe(400);
  }

  const api = await request.get(`${base}/api/healthcheck`);
  expect(await api.json()).toEqual({ response: "OK" });

  const missingFile = await request.get(`${base}/proj_pub/nonexistent/file`);
  expect(missingFile.status()).toBe(404);
  expect(missingFile.headers()["content-type"]).toContain("application/json");

  const response = await new Promise<string>((resolve, reject) => {
    const sendHandshake = () => {
      socket.write(
        `GET /ws/chat?conversation=missing HTTP/1.1\r\n` +
        `Host: ${address}:5173\r\n` +
        `Upgrade: websocket\r\nConnection: Upgrade\r\n` +
        `Sec-WebSocket-Key: ${randomBytes(16).toString("base64")}\r\n` +
        `Sec-WebSocket-Version: 13\r\n\r\n`,
      );
    };
    const socket = scheme === "https"
      ? connectTls({
          port: 5173,
          host: address,
          servername: address,
          rejectUnauthorized: process.env.IGNORE_HTTPS_ERRORS !== "true",
        }, sendHandshake)
      : connect(5173, address, sendHandshake);
    let headers = "";
    socket.setTimeout(5000, () => socket.destroy(new Error("WebSocket handshake timed out")));
    socket.on("error", reject);
    socket.on("data", (chunk) => {
      headers += chunk.toString();
      if (headers.includes("\r\n\r\n")) {
        socket.destroy();
        resolve(headers);
      }
    });
    socket.on("end", () => reject(new Error("WebSocket connection closed before the handshake")));
  });
  expect(response).toMatch(/^HTTP\/1\.1 101 /);
});
