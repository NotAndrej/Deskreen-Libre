# Deskreen Libre (UNOFFICIAL)

![platform](https://img.shields.io/badge/platform-Windows%20%7C%20MacOS%20%7C%20Linux-lightgrey)

![Deskreen Logo](https://raw.githubusercontent.com/NotAndrej/Deskreen-Libre/master/resources/icon.png)

Deskreen turns any device with a web browser into a secondary screen for your computer

**A fork of [Deskreen CE](https://github.com/pavlobu/deskreen) with trackers and Pro upsells removed — and active development.**

## Deskreen CE vs Deskreen Pro vs Teams vs Deskreen Libre

| | Deskreen CE (upstream, free) | Deskreen Libre ($0) | Deskreen Pro ($24.99/yr) | Deskreen Pro Teams ($139.99/yr) |
|---|---|---|---|---|
| Connected viewing devices | 1 | Unlimited | Up to 5 | Unlimited |
| Dark theme | — | ✅ (Light / Dark / OS Auto, Legacy + Modern) | ✅ | ✅ |
| Advanced viewer controls | — (Flip is Pro-gated) | ✅ (quality, fullscreen, flip, rotate, auto-hiding bar) | ✅ | ✅ |
| Trusted devices + stronger security | — | ✅ (trust per device, auto-allow on reconnect) | ✅ | ✅ |
| Device aliases + client MAC display | — | ✅ | ✅ | ✅ |
| Presenter cursor highlight | — | ✅ | — | ✅ |
| Switch streams without reconnecting | — | ✅ (per viewer, from the devices drawer) | — | ✅ |
| Custom server port | — | ✅ (Settings, restart to apply) | ✅ | ✅ |
| Network interface picker | — (CLI flag only) | ✅ (Settings dropdown) | ✅ | ✅ |
| Prevent accidental quit | — | ✅ (on by default, toggle in Settings) | ✅ | ✅ |
| Prevent sleep while sharing | — | ✅ (automatic) | ✅ | ✅ |
| Auto-reconnect after sleep / network drop | Basic retry | ✅ (wake + online triggers) | ✅ | ✅ |
| Auto-start on login | — | ✅ (toggle in Settings) | ✅ | ✅ |
| Team seats and shared management | — | — (no accounts by design) | — | ✅ |
| Support | Community | Community | Priority | Priority |
| Trackers / upsells | Google Analytics + Pro upsell | None. Ever. | — | — |

## How Deskreen Libre differs from Deskreen CE

- **No tracking.** Google Analytics (host + viewer), consent dialogs, and unused telemetry packages are gone.
- **No "Pro" upsell.** No upgrade buttons, no "available only in Pro version" screens. Every feature in the app is the whole app.
- **Unlimited viewers.** CE allows one viewing device at a time; Libre lets you connect as many as you like. Each viewer gets its own session and shares the same selected screen source.
- **Color Theme: Light / Dark / Auto.** Auto follows your OS theme live, including changes while the app is open.
- **UI Styles: Legacy / Modern.** Modern is a refined reskin (purple accent, rounder surfaces) with full light **and** dark variants, same layout, both themes.
- **The web viewer follows the host.** Dark/light mode and Legacy/Modern styling sync live from the app to every connected viewer, including mid-session changes.
- **Fresh branding.** New icon everywhere: desktop app, installer, viewer, favicon, and the logo embedded in the QR code.
- **Modernized dependencies.** Unmaintained `@material-ui/core` v4 replaced with `@mui/material` + `tss-react`; `npm audit` reports 0 production vulnerabilities in both packages.
- **Fixed along the way.** Scannable QR on dark backgrounds, MUI components actually following dark mode, stale "viewer already connected" states after manual disconnects, and more.

Deskreen is an `electron.js` based application that uses `WebRTC` to make a live stream of your computer screen to a web browser on any device. It is available for MacOS, Windows and Linux operating systems.

---

### ▶️ [See how people use Deskreen on Youtube](https://www.youtube.com/results?search_query=deskreen) (video tutorials, demos, use cases for Deskreen day to day usage)

---

## [Deskreen Frequently Asked Questions](https://deskreen.com/faq)

---

### Prerequisites

You will need to have `node>=v23` `npm>=10` installed.


1. git clone this repo
2. `npm i`
3. `cd ./src/client-viewer && npm i && cd ../..` (the web viewer is a separate package, don't skip this)
4. `npm run clean && npm run build && npm run start` -- run in prod like mode

Commit before testing: files that have never been committed are invisible to git's safety net.

#### for more npm scripts look at `package.json`

## Starting with Custom Local IP

You can start Deskreen Libre with a custom local IP address using the `--local-ip` or `--ip` CLI flag. This is useful when you want to specify a particular network interface IP address.

### macOS

```bash
# Using open command (recommended)
open -a "Deskreen Libre" --args --ip 192.168.1.100

# Or using the executable directly
/Applications/Deskreen\ Libre.app/Contents/MacOS/Deskreen\ Libre --ip 192.168.1.100

# Get your IP automatically and launch
open -a "Deskreen Libre" --args --ip "192.168.1.100"
```

### Windows

```powershell
# Using Start-Process (PowerShell)
Start-Process "Deskreen Libre" -ArgumentList "--ip", "192.168.1.100"

# Or using the executable directly
"C:\Program Files\Deskreen Libre\Deskreen Libre.exe" --ip 192.168.1.100

# Or from Command Prompt
start "" "C:\Program Files\Deskreen Libre\Deskreen Libre.exe" --ip 192.168.1.100
```

### Linux

```bash
# If installed via AppImage
./Deskreen\ Libre-*.AppImage --ip 192.168.1.100

# If installed via .deb/.rpm package (usually in /usr/bin or /opt)
deskreen-libre --ip 192.168.1.100

# Or using full path
/opt/Deskreen\ Libre/deskreen-libre --ip 192.168.1.100
```

**Note:** Replace `192.168.1.100` with your actual local IP address. You can find your IP using:
- **macOS/Linux:** `ipconfig getifaddr en0` or `ifconfig | grep "inet "`
- **Windows:** `ipconfig` (look for IPv4 Address)

When using the `--ip` or `--local-ip` flag, the app will use the specified IP for QR codes and connection URLs, while still monitoring the actual network interface status for WiFi connection detection.

## Maintainer

- [Pavlo (Paul) Buidenkov](https://www.linkedin.com/in/pavlobu) (upstream)
- [Not Andrej](https://github.com/NotAndrej) (Deskreen Libre fork)

## License

AGPL-3.0 License © [Pavlo (Paul) Buidenkov](https://github.com/pavlobu/deskreen)

## Copyright

Electron-Vite MIT License © [electron-vite](https://github.com/alex8088/electron-vite)

React MIT License © [Facebook, Inc. and its affiliates](https://github.com/facebook/react)

Vite MIT License © [Vite.js](https://github.com/vitejs/vite)

Electron Builder MIT License © [electron-builder contributors](https://github.com/electron-userland/electron-builder)

Apache 2.0 © [blueprintjs](https://github.com/palantir/blueprint)

Font Awesome Free (CC BY 4.0) © [Fonticons, Inc.](https://fontawesome.com/)

simple-peer MIT. Copyright © [Feross Aboukhadijeh](http://feross.org/)

tweetnacl ISC License © Dmitry Chestnykh, Devi Mandiri, and contributors (https://github.com/dchest/tweetnacl-js)

darkwire.io MIT License © [darkwire/darkwire.io](https://github.com/darkwire/darkwire.io)

And many many others...

## Thanks

🙏 Many thanks to all 🌍 open source community members and maintainers of libraries used in this project.
