# Chaingraph

## Documentation

- [User guide](https://github.com/remcoros/chaingraph/blob/main/docs/user-guide.md)
- [Encryption and storage](https://github.com/remcoros/chaingraph/blob/main/docs/encryption-and-storage.md)

## Getting set up

1. Make sure **Bitcoin** and **Fulcrum** are running and synchronized. Complete any
   requested Bitcoin configuration so transaction indexing is enabled and pruning
   is disabled.
2. Open **Chaingraph** using its HTTPS address. Trust your server's certificate in
   your browser so workspace encryption is available.
3. Create a workspace with a name and password, or open a bundled example. Keep
   your workspace password: it cannot be recovered.

Chaingraph has no service login. Keep access within a trusted network; anyone who
can reach its address can use the read-only chain API. Your workspace password
protects your saved workspace, rather than access to the service.

## Using Testnet4

Stop Chaingraph and run **Enable Testnet4** to add the separate **Bitcoin
Testnet4** and **Fulcrum Testnet4** connections. Start Chaingraph once that pair
is ready, then reload your browser to select Testnet4 for a new workspace.

The action becomes **Disable Testnet4** while enabled. Disabling it removes live
Testnet4 queries. You can still open and edit the saved data in existing
Testnet4 workspaces offline.

## Keeping your work

Workspaces save encrypted in your browser. Export encrypted workspace files to
back up your wallets, loaded transactions, and annotations. StartOS backups save
only the package's Testnet4 selection.

Use the same HTTPS address to return to your browser's saved workspaces. Export
before changing browsers, hostnames, ports, or clearing browser data. BIP329
exports are plaintext label files; use encrypted workspace exports for a complete
backup.

## Connection problems

The web interface can remain ready while a Bitcoin/Fulcrum pair is unavailable.
Check the corresponding **Mainnet Connection** or **Testnet4 Connection** health
check. Confirm that both services are running and synchronized, then try again.
Saved workspaces remain usable while live queries are unavailable.
