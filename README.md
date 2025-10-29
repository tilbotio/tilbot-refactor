# Tilbot: democratizing conversational agent development and research

This is a version of the Tilbot platform that uses SvelteKit and Tailwind CS and DaisyUI. It is still under development and does not contain the functionality of the initial version of Tilbot (built on jQuery) yet.

## Getting Started

Using docker:

```sh
docker-compose up --build
```

Go to http://localhost:5173/login in your browser.

Use the suggested credentials for the admin user.

Create a new user. Log out, then log in using that new user.
Create a project. Use the link icon to go to that project.

## Integration testing

Note that the integration tests expect a clean environment (e.g., empty MongoDB).
To set this up, either ensure a clean DB (bare metal), or (recommended) temporarily launch a Docker environment with a separate project name:

```sh
docker-compose -p up tilbot-test --build
```

Integration tests can be executed using `npm run test-integration` or `npm run test-integration-ui`.

To clear the Docker environment and DB volume after testing has completed, you can use:

```sh
docker-compose -p tilbot-test down -v
```
