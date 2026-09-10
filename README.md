# LaStar official website

The official brand, legal and Android Beta download site at **https://lastar.me**.
GitHub Pages hosts the reviewed static files on `main`. No client-side framework,
external font/CDN, trackers, private credentials or runtime database connection.

## Work locally

```powershell
npm ci --ignore-scripts
npx playwright install chromium firefox webkit
npm run build
npm run check
npm test
npm run performance
npm run serve
```

After the Pages cutover, `node scripts/public-check.mjs` checks public HTTPS,
metadata, assets and the custom 404. `node scripts/qa.mjs --live` runs the same
browser suite against the fixed `https://lastar.me` origin; it never clicks APK
download links or sends data to the backend. `--chromium`, `--firefox`, `--webkit`
and `--edge` allow a targeted engine run while diagnosing platform issues.

Source lives in `content/pages.mjs`, `scripts/build.mjs`, `site.css`, and `site.js`.
Generated HTML is committed so Pages has no build dependency. Legacy legal `.html`
URLs remain functional and point at the clean canonical route. `404.html` is the
native GitHub Pages fallback. QA artifacts are local or CI artifacts, not public
site assets.

## Release cutover

`release-meta.json` is the only current version/asset source. Its public verification
flags are assertions backed by the release operator's public GET and SHA evidence,
not checks that the static website can perform itself.

1. Verify the exact signed APK and publish immutable and stable-name copies.
2. Independently download each public asset into a fresh path and compare SHA-256.
3. Only then set `public_verified`, the real publication date, version, size and SHA.
4. Set `latest_verified` only after GitHub `/releases/latest/download/LaStar-Beta.apk`
   returns the correct binary. An unverified latest route never becomes a CTA.
5. Set `service_status` to the actual Beta state (`active`, `paused`, `maintenance`).
   A valid APK does not imply that registration or the backend is available.
6. Build, check, run browsers/accessibility/performance, review screenshots, commit.
7. Publish and verify the public pages. **Update Beta app_config last.**

If `public_verified` is false, the generated download page has no direct APK CTA.
The build fails for missing, malformed or off-repository metadata. Do not use these
flags to skip evidence. Do not replace an already distributed binary with a new
binary under the same version code.

## Images and editorial truth

Brand mark is the real App asset without its square icon background. Open Graph is
rendered from HTML with system Chinese fonts at 1200×630 (`npm run social`), not AI.
The download QR encodes `https://lastar.me/download`. Real screenshot provenance and
approved privacy-preserving crops live in `content/screenshot-provenance.json`.
Do not ship emails, invite codes, QA identity, private chats or profile handles.

The official WeChat QR is the original repository asset. Until real automatic-invite
E2E passes, public copy must say **邀请码由 LaStar 官方渠道逐步发放**. Sending-domain
verification does not prove an inbox can receive mail: no unverified contact email
is advertised. Account deletion and safety instructions follow the existing App.

## Quality and security

`site-qa.yml` has `contents: read` only. It checks local broken links/assets,
metadata, generated output drift, Chromium/Firefox/WebKit at six widths, WeChat/
Android/iOS behavior, keyboard use, 200% text size and axe accessibility. Lighthouse
gates mobile performance ≥85 and accessibility/best practices/SEO ≥95. Browser
emulation does not prove behavior in a physical WeChat WebView.

WebKit follows the OS keyboard-navigation preference for Tab traversal. Its skip
link test explicitly focuses the native anchor and verifies Enter activation;
Chromium/Firefox additionally verify first-Tab discovery. This does not disable
or relax layout, URL, native control, contrast or axe checks.

The manual Release workflow is a separate publishing tool. Website QA cannot
upload Releases, modify GitHub settings or deploy anything. Use the existing
GitHub Pages custom domain; preserve CNAME and all Resend DNS records.

References: [GitHub Pages custom 404](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site),
[Playwright browser installation](https://playwright.dev/docs/browsers),
[GitHub Actions security](https://docs.github.com/en/actions/reference/security/secure-use).
