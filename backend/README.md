# Backend setup

The backend for Tilbot.io is a Fastify application. It uses MongoDB as its database.

### Fastify

You can find the Fastify setup in `server.js`. It uses various Fastify plugins, for session handling
(sessions are kept in MongoDB), file uploads and websockets.

Fastify is used to provide an API, using `/api/` as the prefix for requests.
Most API endpoints return simple strings, such as `OK` and `NOK`.
Sometimes they return JSON.

For convenience, Fastify is configured to send `NOK` if an exception occurs and `OK` if the handler finishes without returning anything.

### WebSockets

The frontend uses websockets for chat sessions. The basic flow is:

1. Request a conversation ID (which will create a ProjectController behind the scenes)
1. Connect a websocket to a URL based on the conversation ID.
1. Pass commands as JSON messages

The JSON messages are simple arrays with the command (a string) being the first element and the command arguments forming the rest of the array.

The conversation IDs and ProjectControllers are currently only maintained in memory.
If the server restarts, the flow is lost.

## Previously

The above differs from the previous setup, where a new process would be started for each project.

This was harder to implement because of TCP port management issues.
Additionally, modern container based hosting platforms have the best practice to put processes in separate containers.
This is a problem because these containers are expected to be started and stopped externally, based on load.

## Future

In the future, conversations need to be their own collection in the Mongo database.
This would finally enable us to scale the server containers horizontally.

These conversations would be "living documents".
Chat clients send commands to the server, causing the server to modify these documents.
These commands could be sent over the normal API or over the WebSocket.

The server also monitors changes to these documents and sends updates to clients connected over a websocket.
Changes are monitored on the Mongo database using `db.collection.watch()`.

Rather than sending explicit commands over the websocket, the websockets only send diffs of the conversation document using RFC 6902 JSON patch commands (the initial patch command should send the full document).

Clients then update their display based on the new version of the document (reactive frameworks like Svelte make this easy to do).

Advantages:
1. Proper scaling to large numbers of users
1. Users can (re)connect to a conversation and continue where they left off
1. Multiple users and bots can participate in a conversation based on the conversation ID
