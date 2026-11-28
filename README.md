# Task Manager Backend

## Deploy to Render

This repository includes a Render Blueprint in `render.yaml`. In Render, create a
new Blueprint and select this repository. Render will install production
dependencies with `npm ci --omit=dev`, start the service with `npm start`, and
check `/api/health`.

Before deploying, have a MongoDB connection string ready and make sure your
MongoDB provider allows connections from the Render service. Set `MONGO_URI`
when Render prompts for it. Render generates `JWT_SECRET` automatically.

After deployment, set `CLIENT_ORIGINS` in the Render service environment to the
exact URL(s) of your frontend, separated by commas (no trailing slash). Setting
this variable replaces the backend's built-in frontend allowlist.

To provision the administrator account, set all three of `ADMIN_NAME`,
`ADMIN_PHONE`, and `ADMIN_PASSWORD` in the Render environment. The phone must
be a valid Egyptian mobile number and the password must be exactly four digits.
These values are optional if the admin account is not needed.

## Local development

Use Node.js 20.19.0 or newer. Copy `.env.example` to `.env`, fill in the
environment values, then run:

```sh
npm ci
npm start
```

The backend is plain JavaScript and does not need a compilation step.
