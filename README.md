# Tilbot: democratizing conversational agent development and research

This is a version of the Tilbot platform that uses SvelteKit and Tailwind CS and DaisyUI. It is still under development and does not contain the functionality of the initial version of Tilbot (built on jQuery) yet.

## Getting Started

Using Docker, provide a certificate and private key for the hostname clients use
in `certs/fullchain.pem` and `certs/privkey.pem`. Create a secret file containing
the initial administrator password (at least 16 characters, on one line):

When upgrading an existing deployment, stop its backend before starting the new
version so that project files cannot change during migration:

```sh
docker-compose stop backend
```

```sh
mkdir -p secrets
openssl rand -base64 32 > secrets/admin_password
chmod 600 secrets/admin_password certs/privkey.pem
docker-compose up --build
```

On Windows, the password file can instead be generated in PowerShell:

```powershell
New-Item -ItemType Directory -Force secrets | Out-Null
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$rng.Dispose()
[System.IO.File]::WriteAllText((Join-Path $PWD "secrets\admin_password"), [Convert]::ToBase64String($bytes))
```

Restrict access to the password and private key using Windows file permissions,
then run `docker-compose up --build`.

Alternatively, set `TLS_CERT_FILE`, `TLS_KEY_FILE`, and `ADMIN_PASSWORD_FILE` to
the corresponding host paths before starting Compose. Keep the key and password
file private: Compose mounts the password file as a secret, but does not encrypt
the host file. A network-isolated initialization container copies it to a
Docker volume with permissions restricted to the backend's `node` user. That
volume is not encrypted and remains accessible to Docker administrators.
The certificate must be trusted by clients and valid for the
hostname used to access the service.
After replacing certificate files, recreate the proxy with
`docker-compose up -d --force-recreate frontend` so it uses the new files.

Go to `https://<your-hostname>/login` and sign in as `admin` using the
password in the secret file.

Docker builds the SvelteKit production server and routes frontend, API, project
files, and WebSocket requests through nginx. Source changes require rebuilding
the images. On first startup, project files from `backend/projects` and
`backend/proj_pub` are copied into Docker volumes. The host directories remain
unchanged as backups, but subsequent project changes are stored only in the
volumes. Back up the project volumes together with the MongoDB volume.

Do not delete the migration marker files in the project volumes. Stopping midway
through migration is safe to retry while the original backend remains stopped.
Running `docker-compose down -v` removes the project and database volumes.

MongoDB and the backend are not published on host ports; the frontend proxy
accesses the backend over the Compose network. Direct host access to either
service requires an explicit local override. HTTPS terminates at nginx, and the
backend trusts forwarded HTTPS headers on the Compose network.

The password secret is used only when no active administrator exists. Existing
accounts are not changed: if this deployment previously used `admin` / `admin`,
change that password immediately through the dashboard before exposing it.
Keep the secret file available for Compose on subsequent starts.

Create a new user. Log out, then log in using that new user.
Create a project. Use the link icon to go to that project.


Bare metal and standalone app for editing project files:

```sh
npm install -g corepack
yarn policies set-version 4.13.0
yarn install
```

Note that there are currently some issues with the latest version of node (26.x) and Electron.
Downgrading to a version (I tried 22.22.3) fixes any "Electron failed to install correctly" errors.
For a fresh bare-metal backend database, set `ADMIN_PASSWORD_FILE` to a
readable secret file before starting the backend.

## Integration testing

Note that the integration tests expect a clean environment (e.g., empty MongoDB).
To set this up, either ensure a clean DB (bare metal), or (recommended) temporarily launch a Docker environment with a separate project name:

```sh
docker-compose down -t 0 --remove-orphans
docker-compose -p tilbot-test down -t 0 -v --remove-orphans
docker-compose -p tilbot-test build
docker-compose -p tilbot-test run tests
```

For bare-metal browser tests, set `ADMIN_PASSWORD_FILE` to the password for the
existing administrator. For HTTPS, set `FRONTEND_SCHEME=https`; set
`IGNORE_HTTPS_ERRORS=true` only when testing with an untrusted test certificate.

With MongoDB running and dependencies installed, the backend compatibility tests
can also be run with:

```sh
node --import tsx --test tests/unit/tests/sessionstore.integration.ts tests/unit/tests/user.integration.ts
```

Set `MONGO_DB` if MongoDB is not available at `mongodb://127.0.0.1:27017/tilbot`.
The Compose MongoDB service is not accessible on that host port by default.
These tests create and remove a temporary user and a temporary session collection.

With Docker running, the project-volume migration and secret-permission tests use
isolated temporary volumes and can be run with:

```sh
node --test tests/integration/docker-init.test.mjs
```

To clear the Docker environment and DB volume after testing has completed, you can use:

```sh
docker-compose -p tilbot-test down -t 0 -v --remove-orphans
```

You can also run the test suite as part of an entire Docker environment by running:

```sh
docker-compose -p tilbot-test --profile testing up --build
```

And when tests are finished:

```sh
docker-compose -p tilbot-test --profile testing down -t 0 -v --remove-orphans
```

The test deployment has separate database and project volumes. On first startup
it copies the host project-file directories into its own project volumes.
