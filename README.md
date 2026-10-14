<p align="center">
  <img src="icon.svg" alt="Chaingraph Logo" width="21%" />
</p>

# Chaingraph on StartOS

> Everything not listed in this document should behave the same as upstream
> Chaingraph. If a feature, setting, or behavior is not mentioned here,
> the upstream documentation is accurate and fully applicable. See the
> Documentation section of `instructions.md` for links.

[Chaingraph](https://github.com/remcoros/chaingraph) is a watch-only Bitcoin
workbench for wallet review and on-chain investigation.

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

## Image and Container Runtime

The package builds an unmodified upstream checkout from the public commit pinned
by `CHAINGRAPH_COMMIT` in `Dockerfile`. The Node base image is pinned by digest.
The build compiles the browser application and bundles the server; the runtime
contains no development dependencies. It supports x86_64 and aarch64.

The `chaingraph` daemon runs `node /app/server.cjs` as the image's unprivileged
`node` user in the `chaingraph-sub` subcontainer, with `/app` as its working
directory. StartOS supplies process supervision; the image has no separate init
process. No application source patches, database, or sidecars are included.

## Volume and Data Layout

The package persists its Testnet4 selection on the `startos` volume. No
subcontainer mounts that volume. Browser workspaces are outside package storage.

| Resource | Location | Purpose |
| --- | --- | --- |
| `startos` volume | `store.json`, no container mount | Testnet4 selection |
| Generated rootfs files | `/run/chaingraph/.env.mainnet`, optionally `.env.testnet4` | Current dependency connections |
| Bitcoin `main` volume | `/mnt/bitcoin-mainnet`, read-only | Mainnet RPC cookie directory |
| Bitcoin Testnet4 `main/testnet4` directory | `/mnt/bitcoin-testnet4`, read-only when enabled | Testnet4 RPC cookie directory |

The dependency directories are UID/GID mapped from root to the runtime user so
mode-restricted cookies remain readable without changing Bitcoin's permissions.
Directory mounts follow cookies replaced by Bitcoin. The mainnet mount necessarily
contains other Bitcoin files alongside its cookie; it is read-only.

## File Models

`startos/fileModels/store.json.ts` models the package's `store.json` as JSON.
Its `testnet4Enabled` default is false. Initialization merges defaults without
resetting an existing selection or removing unknown fields; the toggle action
changes only that selection.

The upstream dotenv files are generated into the subcontainer rootfs on every
start from the resolved dependency bindings and cookie paths. They contain no
copied RPC password. They are not persistent file models: every startup removes
the previous generated files before writing the currently available pairs.
Hand edits to them do not survive a restart.

The package sets `SERVER_HOST`, `SERVER_PORT`, `CHAINGRAPH_NETWORK_CONFIG_DIR`,
and `CORS_ALLOW_ORIGINS` on the daemon. Allowed origins follow the UI interface's
current addresses, including scheme and port, so the upstream Host/Origin guards
remain effective behind the HTTPS proxy.

## Dependencies

Mainnet always uses Bitcoin and Fulcrum. Testnet4 adds its own isolated pair only
while the stored selection is enabled. There are no custom endpoint settings or
alternative Electrum providers in this package.

| Package id | Requirement | Health check | Purpose |
| --- | --- | --- | --- |
| `bitcoind` | Required | `bitcoind` | Mainnet chain queries and RPC cookie |
| `fulcrum` | Required | `primary`, `sync-progress` | Mainnet address history and UTXO queries |
| `bitcoind-testnet` | Conditional | `bitcoind` | Testnet4 chain queries and RPC cookie |
| `fulcrum-testnet` | Conditional | `primary`, `sync-progress` | Testnet4 address history and UTXO queries |

Addresses are resolved reactively with `getBridgeAddress` using provider-exported
Bitcoin and mainnet Fulcrum constants. The Testnet4 Fulcrum binding contract is
verified against its source and held in `utils.ts`; its wrapper still targets an
incompatible SDK and cannot be imported into the scaffold’s dependency check. The package never assumes assigned external ports,
uses deprecated service DNS names, or dials another container's IP. Plaintext
connections remain on the internal host bridge.

A missing binding is omitted rather than replaced with a fabricated endpoint.
If no complete pair resolves, the connection health check fails without starting
the web daemon. If one pair resolves, it remains usable while the other enabled
pair's check reports failure. Dependency requirements report availability; they
are not startup readiness gates.

## Network Access and Interfaces

The `ui` interface on host `ui` serves the browser application and same-origin
read-only API on internal HTTP port 3000. StartOS terminates HTTPS. There are no
separate RPC, Electrum, metrics, or peer interfaces provided by this package.

The interface has no access password. Anyone who can reach it can use its allowed
chain queries and consume node resources. CORS and Host checks constrain browser
requests; they do not authenticate callers.

## Installation and First-Run Flow

Initialization installs the interface and action, declares dependencies, and
merges the stored defaults. Mainnet is selected initially; no application login,
credential generation, or account setup is performed.

The package requests transaction indexing and disabled pruning on each selected
Bitcoin dependency through its autoconfig action. Existing matching settings
satisfy those requests without changes. Startup reads the selected pairs and
writes their isolated network files before launching the server.

## Actions

Use `toggle-testnet4` when adding or removing Testnet4 support. Its displayed name
changes between **Enable Testnet4** and **Disable Testnet4** according to the
stored state. It updates `store.json`; dynamic dependencies react to the change.
The action is available while stopped, and the next start regenerates network
configuration. It runs quickly and returns confirmation, without credentials.

Each invocation reverses the current selection, so running it twice restores the
previous state. Disabling Testnet4 does not delete browser workspaces; their saved
data remains available for offline use.

## Tasks

Each enabled Bitcoin integration can raise a critical task on its Bitcoin service
when `prune` is not zero or `txindex` is not true. The task offers the dependency's
hidden autoconfig action with those settings prefilled. Matching configuration
clears it; later configuration drift raises it again. Testnet4 dependency tasks
are inactive while that integration is disabled.

There are no own-package setup tasks or hidden package actions.

## Health Checks

The `chaingraph` daemon's readiness check fetches the UI and network-discovery
endpoint. It reports web availability independently of upstream connectivity.
Failure means the HTTP server has not started or is not serving its endpoints;
inspect the `chaingraph-sub` logs and dependency bindings.

`mainnet` and, when enabled, `testnet4` poll the corresponding `/api/status`
endpoint every 30 seconds. Success verifies Bitcoin's network identity and a
responsive Electrum server with the matching genesis. Failure means that pair
cannot currently serve live lookups; check its Bitcoin/Fulcrum services and logs.
These checks do not certify full synchronization or transaction-index coverage.

If no complete pair resolves, `connections` reports the missing connection setup.
Binding changes reactively rerun main so installing a missing dependency can heal
the package without stale placeholder addresses.

## Backups and Restore

Backups snapshot the `startos` volume, preserving the Testnet4 selection. Restore
keeps that selection and resolves dependency addresses anew. Generated dotenv
files and dependency cookies are not included; the selected Bitcoin/Fulcrum
services provide their own data and authentication after restore.

StartOS backups do not include browser workspaces. Encrypted workspace exports
are the backup mechanism for wallets, loaded transactions, and annotations.

## Limitations and Differences

This package deliberately exposes a small configuration surface.

1. Mainnet is always selected; Testnet4 is optional. Only the named StartOS
   Bitcoin/Fulcrum services are supported.
2. There is no UI/API access password. Use trusted-network access; the package
   does not provide a supported public or multi-user hosting mode.
3. Optional exact-output spender-index lookup stays disabled. Chaingraph uses its
   normal bounded Electrum-history path; transaction indexing remains required.
4. Workspaces belong to each browser origin. A changed hostname or HTTPS port
   uses different browser storage; encrypted exports are needed for transfer.
5. A complete dependency pair must resolve to start the server. Temporarily
   unreachable configured upstreams do not prevent the UI from serving saved data.

## Quick Reference for AI Consumers

The following inventory describes the package's operable surface.

```yaml
package_id: chaingraph
image: local Dockerfile from remcoros/chaingraph
architectures: [x86_64, aarch64]
subcontainers: [chaingraph-sub]
volumes:
  startos: unmounted
file_models:
  - startos/store.json
startos_managed_env_vars:
  - SERVER_HOST
  - SERVER_PORT
  - CHAINGRAPH_NETWORK_CONFIG_DIR
  - CORS_ALLOW_ORIGINS
dependencies: [bitcoind, fulcrum, bitcoind-testnet, fulcrum-testnet]
interfaces:
  ui: { type: ui, port: 3000 }
actions:
  - toggle-testnet4
tasks:
  - { action: bitcoind/autoconfig, severity: critical }
  - { action: bitcoind-testnet/autoconfig, severity: critical }
health_checks: [chaingraph, mainnet, testnet4, connections]
```
