# Deployment and editing

The approved redesign lives in `site/`. The original Hugo source is preserved on `archive/hugo-site` at commit `ab2880e`; unused Hugo files have been removed from the active branch. Netlify production now deploys `website-redesign` directly, as requested. The old website also remains on `main` until the branch transition is completed.

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
4. Open `/admin/`, sign in with GitHub, and test a draft. `CMS_BRANCH` in `netlify.toml` keeps both the live editor and draft-preview editors saving to `website-redesign`. Change this setting if the production branch changes later.

References: https://decapcms.org/docs/github-backend/ and https://docs.netlify.com/manage/security/secure-access-to-sites/oauth-provider-tokens/.

### Draft and publishing workflow

Production uses Decap editorial workflow. Save drafts, review them, and publish when ready; Netlify builds the published content. Drafts are stored as GitHub workflow branches, not only in a browser. For an existing public post, switching off Include on the website and publishing hides it while retaining its content. Deleting removes the source entry; Git history can recover it. Changing a published post address requires an added redirect to preserve old links.

## Local preview

Run `node site/dev.mjs` from the repository. It serves localhost port 8766 and rebuilds when content or photos change. For local editing, also run the official `decap-server` from this repository's root (port 8081). The locally generated editor configuration explicitly enables a file-system backend, without external authentication, and is never committed. Production builds omit the local backend and use GitHub authentication.

## Release sequence

1. Push changes to `website-redesign`; Netlify automatically builds and publishes that branch.
2. Verify `yitang.info`, HTTPS, page assets, and old-route redirects.
3. Complete OAuth setup and test editing, including photos and draft persistence.
4. Review editorial drafts before publishing. The open pull request against `main` is optional while Netlify deploys `website-redesign` directly.

## Validation completed locally

Automated checks cover post create/edit/delete/unpublish, inline links and images, thumbnail modes, changing headshot/font, paper order, local asset/page references, and isolation of local/production CMS configuration. Browser testing saved, edited, and deleted a disposable post and uploaded a disposable photograph through Decap's local backend. No test content remains. Hosted GitHub login, draft saving and publication, Netlify deployment, gallery uploads, and draft-image loading have also been verified in the live editor.


## Recommended transition to main

The archive branch already preserves the old site. Keep it unchanged.

1. Merge the current redesign into `main` using the existing redesign pull request. Preserve any newer CMS publications; do not reset or force-push either branch.
2. Update `CMS_BRANCH` in `netlify.toml` to `main` and the local preview branch in `site/dev.mjs` to match. The build-generated editor config must save to the same branch Netlify publishes.
3. Set Netlify’s production branch to `main`, retaining the existing build command and publish directory.
4. Verify the live website, editor login, saving, publication, and photos. Existing CMS drafts should target `main` before they are published; check their pull requests and previews during the transition.
5. Use `main` for future website maintenance. Retire `website-redesign` only after all existing drafts and references are accounted for.

This transition has not yet been performed; production and the editor still use `website-redesign`.
