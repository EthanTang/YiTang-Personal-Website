# Deployment and editing

The approved redesign lives in `site/`. The original Hugo source remains in the repository so the previous version can be recovered. The redesign branch is `website-redesign`; production is currently `main`.

## Build

Requires Node 24; no package installation is required for the production build.

```
node site/test.mjs
node site/build.mjs
```

Netlify reads `netlify.toml`: build command `node site/build.mjs`, publish directory `site/public`, Node 24. Old page paths redirect to the corresponding redesigned pages. Generated files are ignored by Git.

## Editor

The production editor is `/admin/`. Content is JSON in `site/content`; rich text fields contain Markdown, with a visual toolbar in the editor. Uploaded photos and PDFs go to `site/static/assets/uploads`. Decap CMS 3.16.3 and Marked 17.0.5 are pinned and vendored with licenses; fonts and font licenses are self-hosted.

All main page content, professional links, headshot, CV, and font selection have editing controls. Blog posts support create/edit/delete, draft workflow, hyperlinks, inline photos, gallery photos with captions/descriptions, and automatic/custom/disabled thumbnails. Publications sort in-press first, then by year. Working paper order follows the draggable list. Student coauthors can be linked, emphasized, and identified beside their paper. Font choices are Fontin, Libertinus Serif, and Georgia.

The homepage displays the newest three posts plus the retained conducting post. This number and additional featured posts are editable in Homepage. Historical posts can have a custom date label, such as Spring 2021; their separate date is used only for sorting.

### Login setup (account owner)

1. Create a GitHub OAuth App in Settings → Developer settings → OAuth Apps.
2. Application name: Yi Tang Website Editor. Homepage: `https://yitang.info`. Authorization callback: `https://api.netlify.com/auth/done`.
3. In the existing Netlify project, open Project configuration → Security → OAuth → Install Provider. Select GitHub and enter the application's Client ID and Client Secret there. Keep the secret in Netlify, never in repository content or chat.
4. Open the preview's `/admin/`, sign in with GitHub, and test a draft. The generated CMS configuration edits the deployment's branch, so a redesign preview edits `website-redesign`, not `main`. Production edits `main`.

References: https://decapcms.org/docs/github-backend/ and https://docs.netlify.com/manage/security/secure-access-to-sites/oauth-provider-tokens/.

### Draft and publishing workflow

Production uses Decap editorial workflow. Save drafts, review them, and publish when ready; Netlify builds the published content. Drafts are stored as GitHub workflow branches, not only in a browser. For an existing public post, switching off Include on the website and publishing hides it while retaining its content. Deleting removes the source entry; Git history can recover it. Changing a published post address requires an added redirect to preserve old links.

## Local preview

Run `node site/dev.mjs` from the repository. It serves localhost port 8766 and rebuilds when content or photos change. For local editing, also run the official `decap-server` from this repository's root (port 8081). The locally generated editor configuration explicitly enables a file-system backend, without external authentication, and is never committed. Production builds omit the local backend and use GitHub authentication.

## Release sequence

1. Push the redesign branch and open a pull request against main.
2. Verify the existing Netlify project produces a Deploy Preview with the new build settings.
3. Complete OAuth setup and test editing on the preview, including photos, draft persistence, and deletion.
4. Review desktop/mobile pages and old-route redirects on the preview.
5. Merge only after review. Verify `yitang.info`, HTTPS, and the production editor afterward.

## Validation completed locally

Automated checks cover post create/edit/delete/unpublish, inline links and images, thumbnail modes, changing headshot/font, paper order, local asset/page references, and isolation of local/production CMS configuration. Browser testing saved, edited, and deleted a disposable post and uploaded a disposable photograph through Decap's local backend. No test content remains. Hosted login, GitHub draft workflow, and Netlify deployment require the account connection and remain to be verified on the hosted preview.
