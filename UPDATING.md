# Updating Chaingraph

## Alpha builds from main

There is no public container release for the initial package. Its version is
`0.1.0-alpha:0`, and `Dockerfile` pins public `remcoros/chaingraph` main commit
`720f28bc60f1e580ba30146f31ba95a5afae2be8` using `ARG CHAINGRAPH_COMMIT`.
The build downloads that exact source archive; it never follows a moving branch
at build time and never copies the local application checkout into the image.

1. Inspect the published main changes, including runtime configuration, browser
   workspace compatibility, release guidance, and upstream Dockerfile changes.
2. Verify the chosen full commit SHA is published on main. Update the Dockerfile's
   `CHAINGRAPH_COMMIT` default to that SHA.
3. Keep the upstream portion `0.1.0-alpha` and increment the downstream revision
   in `startos/versions/current.ts`: `:1`, `:2`, and so on. Update release notes
   in all supported locales. Do this for every SHA or packaging change released.
4. Update the base Node tag and digest together when necessary. Verify amd64 and
   arm64 descriptors exist; preserve upstream's compilation and runtime layout.
5. Build both package architectures. Verify the package on StartOS: both network
   identities, live transaction/address queries, HTTPS origin guards, Testnet4
   toggle and dependency activation, cookie permissions, restart persistence,
   and backups when a target and password are available.

Keep encrypted browser workspace exports before upgrades. Package backups do not
capture browser workspaces. Maintain `current.ts` in place; add a historical
version file only when a real migration requires preserving the previous one.

## Switching to the first public container release

Watch the upstream GitHub Releases and `docs/release-process.md`. A release's
PGP-signed mapping, not a mutable container tag, is the source of the image pin.

Verify the source tag and mapping signatures using the upstream release-key
fingerprint, confirm the mapping's source SHA equals the signed tag's commit,
and verify its amd64/arm64 image descriptors. Replace the manifest's
`dockerBuild` source with `dockerTag: '<image.name>@<image.indexDigest>'` from the
verified mapping and remove the custom Dockerfile when no longer needed.

Use the complete published upstream version with downstream revision zero
(e.g. `0.1.0:0` for the first stable release). Preserve the existing volume,
action ids, and settings; review workspace-format compatibility and update
README/instructions for any changed behavior.

## Publishing package releases

Automatic tagging is disabled: `.github/workflows/tagAndRelease.yml.disabled`
is retained as an inactive template. Pushing `main` does not create a release.
The active `release.yml` workflow builds and releases packages when a version
tag is pushed. Configure the repository's `DEV_KEY` secret before releasing;
registry uploads also need their registry and storage settings.

Use `v<upstream-version>_<downstream-revision>` for package tags. The initial
`0.1.0-alpha:0` package uses `v0.1.0-alpha_0`. Push a tag only after the package
version, source pin, release notes, and validation are ready.

## Packaging dependencies

`package.json` and `package-lock.json` pin provider repositories so their exported
binding constants and autoconfig actions remain reviewable. When updating them,
inspect the provider APIs, supported package versions, cookie locations, and
health-check ids. The Testnet4 Fulcrum provider uses a different internal port
from mainnet; verify its binding contract in `utils.ts` against provider source and resolve
the live bridge binding. Replace the local Testnet4 port constant with a provider
import once that wrapper supports the current SDK. Keep the SDK override to avoid incompatible nested SDK copies.

Some npm versions require explicit per-command permission for transitive Git
package preparation when the local `allow-git` policy is `root`. Review the
provider dependency graph before using `npm_config_allow_git=all npm ci`; this
does not change the user's npm configuration.
