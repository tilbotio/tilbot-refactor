FROM node:26.7.0-slim AS workspace

RUN npm install --global corepack && corepack enable
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
COPY app/package.json app/package.json
COPY tests/unit/package.json tests/unit/package.json
COPY tests/integration/app/package.json tests/integration/app/package.json
COPY tests/integration/frontend/package.json tests/integration/frontend/package.json

FROM workspace AS frontend-build
RUN yarn workspaces focus frontend
COPY frontend/ frontend/
COPY common/ common/
RUN yarn workspace frontend build

FROM workspace AS frontend-dependencies
RUN yarn workspaces focus frontend --production

FROM node:26.7.0-slim AS frontend
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
WORKDIR /app
COPY --from=workspace /app/package.json ./
COPY --from=frontend-dependencies /app/node_modules/ node_modules/
COPY --from=frontend-dependencies /app/frontend/ frontend/
COPY --from=frontend-build /app/frontend/build/ frontend/build/
USER node
CMD ["node", "frontend/build"]

FROM workspace AS backend-dependencies
RUN yarn workspaces focus backend

FROM node:26.7.0-slim AS backend-init
COPY docker/backend-init.sh /usr/local/bin/backend-init
ENTRYPOINT ["sh", "/usr/local/bin/backend-init"]

FROM node:26.7.0-slim AS backend
ENV NODE_ENV=production
WORKDIR /app
COPY --from=workspace /app/package.json ./
COPY --from=backend-dependencies /app/node_modules/ node_modules/
COPY --from=backend-dependencies /app/backend/ backend/
COPY backend/ backend/
COPY common/ common/
RUN mkdir -p backend/projects backend/proj_pub
WORKDIR /app/backend
USER node
CMD ["node", "--import", "tsx", "server.ts"]

FROM workspace AS tests
RUN yarn workspaces focus integration
RUN yarn workspace integration playwright install --with-deps
COPY tests/integration/frontend/ tests/integration/frontend/
CMD ["yarn", "workspace", "integration", "playwright", "test"]
