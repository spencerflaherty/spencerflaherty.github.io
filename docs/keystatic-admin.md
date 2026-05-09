# Keystatic Admin

The portfolio site still builds with Eleventy from the existing YAML files in `src/content/pages/` and `src/_data/site.yaml`.

Keystatic is only the editing UI. It runs as a small Next.js app at `/keystatic` and writes commits back to the same YAML files through GitHub mode.

## Local Development

```sh
npm run admin:dev
```

Open `http://127.0.0.1:3000/keystatic`.

By default, the admin uses GitHub mode. To test against the local working tree instead, create `.env.local` with:

```sh
NEXT_PUBLIC_KEYSTATIC_STORAGE_KIND=local
```

## Production Setup

Deploy this repo to a Node-capable host such as Vercel for the admin shell. Keep the public Eleventy site on GitHub Pages.

The repo includes `vercel.json`, so Vercel should build the admin with:

```sh
npm run admin:build
```

Required environment variables:

```sh
NEXT_PUBLIC_KEYSTATIC_REPO=spencerflaherty/spencerflaherty.github.io
KEYSTATIC_GITHUB_CLIENT_ID=
KEYSTATIC_GITHUB_CLIENT_SECRET=
KEYSTATIC_SECRET=
NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=
```

The Keystatic GitHub setup flow creates the GitHub App credentials. Add the deployed admin URL as a callback URL in the GitHub App settings.

After confirming edits round-trip through GitHub and trigger the existing Pages build, point `admin.spencerflaherty.com` at the Vercel project.
