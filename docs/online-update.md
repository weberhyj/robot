# Online Update Release Guide

ROBOFLOW uses the Tauri v2 updater plugin and GitHub Releases as the update host.

## One-Time Setup

Generate an updater signing key:

```bash
pnpm tauri signer generate --ci
```

Keep the private key secret. Add these GitHub repository secrets:

- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`

Copy the generated public key into:

```json
{
  "plugins": {
    "updater": {
      "pubkey": "YOUR_PUBLIC_KEY"
    }
  }
}
```

The configured updater endpoint is:

```txt
https://github.com/weberhyj/robot/releases/latest/download/latest.json
```

## Release Flow

Create and push a tag:

```bash
git tag v0.0.3
git push origin v0.0.3
```

The GitHub release workflow will:

- Sync `package.json`, `src-tauri/tauri.conf.json`, and `src-tauri/Cargo.toml` to the release tag version before packaging.
- Build Windows and Ubuntu packages.
- Generate updater artifacts and `.sig` files.
- Generate `latest.json`.
- Upload installers, signatures, and `latest.json` to the GitHub Release.

## Runtime Behavior

The bottom system bar shows the build version and provides a `Check Update` action. When an update is available, the app asks for confirmation, downloads the update, installs it, and relaunches.

## Notes

- Tauri updater signatures are mandatory.
- The private signing key must never be committed.
- The updater compares against the Tauri internal app version, not only the footer text shown in the UI.
- The UI version shown in the bottom bar is injected from the Git tag at build time; release builds also sync the Tauri internal version from the same tag.
