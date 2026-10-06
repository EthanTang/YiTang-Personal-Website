# Local Decap 3.16.3 patch

The vendored `decap-cms.js` has one change in the core `getAsset` action
(`Wc` in this pinned bundle, from `decap-cms-core/src/actions/media.ts`).
Root-relative paths under the configured `public_folder` are first mapped to
the corresponding repository `media_folder` path, preserving subfolders.
Stock Decap treats `/assets/uploads/...` as an absolute external URL, bypassing
Git-backed draft loading entirely. External URLs retain stock behavior.

Before consulting the global path-only asset cache, it uses Decap's `selectMediaFiles` selector (`Rc`) to check the active
draft's `mediaFiles` for a draft file with the resolved repository path and
returns its existing `url`/`displayURL` or local `File` as an AssetProxy.

This keeps each entry's draft media authoritative even if a production asset
request has already failed, is in flight, or cached the same filename. Decap's
GitHub backend already retrieves saved draft files by their blob SHA; no
branch-name guesses, public raw-GitHub requests, DOM mutation observers, or
timed retries are required. The same action serves image controls, Markdown
images, and preview templates. Media-picker thumbnails continue using Decap's
existing entry-media display URLs. Published assets retain the stock behavior.

`site/test-editor-assets.mjs` extracts and executes the actual patched action
from the bundle. Run `node site/test.mjs` after updating Decap. A new bundle
must retain this change or include an equivalent upstream fix; the tests fail
if the pinned action cannot be found. Original licensing is in
`decap-LICENSE.txt`.
