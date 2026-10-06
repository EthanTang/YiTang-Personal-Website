# Yi Tang’s personal website

Source for [yitang.info](https://yitang.info): research, teaching, personal notes, and a blog with photo galleries.

## Update the website

Open [the website editor](https://yitang.info/admin/) and sign in with GitHub.

- **Website pages & settings**: edit your profile, links, headshot, CV, homepage, research, teaching, and Misc.
- **Blog posts**: create or edit posts, add hyperlinks, and upload photos with optional captions. The first gallery or inline photo becomes the homepage thumbnail unless you choose another image or disable it.
- **Save** stores a draft. Review the preview, then **Publish** to update the live site.
- Use an address such as `2026-09-05-shenghan-telehealth-dsi-finalist`: event date plus a specific topic. Keep published addresses stable; changing one requires a redirect for existing links.

## Repository layout

| Location | Purpose |
| --- | --- |
| `site/content/` | Editable page and post content |
| `site/static/` | Fonts, photographs, CV, styles, gallery code, and editor |
| `site/build.mjs` | Generates the website |
| `site/test.mjs` | Content, asset, build, and editor regression checks |
| `site/public/` | Generated output, ignored by Git |
| `netlify.toml` | Hosting and production-editor branch settings |
| `DEPLOYMENT.md` | Deployment and local-development details |

## Branches

- `website-redesign` currently supplies the live website and editor.
- `archive/hugo-site` preserves the complete old Hugo website at commit `ab2880e`. It is for reference and recovery, not ongoing development.
- `main` still contains the old site until the branch transition is completed. The recommended final arrangement is the new website on `main`, with the old site only on `archive/hugo-site`.
- `cms/posts/...` branches hold editorial drafts until publication.

## Build and preview

Use Node.js 24. The production build needs no package installation.

```sh
node site/test.mjs
node site/build.mjs
node site/dev.mjs
```

The local preview runs at `http://127.0.0.1:8766/`. See `DEPLOYMENT.md` for local editor setup.

Netlify builds `website-redesign` with `node site/build.mjs` and publishes `site/public`.

## Licenses

Retain `LICENSE.md` for the original template attribution. Third-party editor, Markdown-parser, and font licenses are included alongside their assets. The local Decap image-loading patch is documented in `site/static/admin/DECAP-PATCH.md`.
