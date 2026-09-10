# Website acceptance — 2026-09-10

## Final deployed acceptance

Source commit `3c7400aa4aeb73469723e20ef029f6e800936a07` passed
[Linux CI34485485963](https://github.com/lastar-official/lastar-download/actions/runs/34485485963):
Chromium58 + Firefox58 + WebKit58 = **174/174**, generated-output drift checks,
and both mobile Lighthouse runs. Home and Download both scored100/100/100/100;
LCP904/1207ms and CLS0 in that Linux lab run.

The first Linux run exposed a200% text overflow that did not reproduce on Windows.
The reflow fix allows long English memory labels and relationship steps to wrap;
the original assertion remains and now saves offending-element diagnostics.
No global overflow masking was used. All three engines passed the regression.

Public `https://lastar.me` passed the eight-page/asset/metadata/custom404 checker,
legacy legal links and old GitHub Pages redirect. The final public Chromium run
passed58 cases again, including mobile/desktop axe and WeChat/iOS handling.
GitHub Pages custom domain and forced HTTPS remain enabled. The backend is still
paused; **none of these website passes claim Beta registration is ready**.

The historical local-run notes below retain the Windows Firefox loader limitation;
the real Firefox acceptance is now supplied by Linux CI, not a skipped engine.

## Reviewed result

- Brand home, metadata-driven Android download, Privacy, Terms, Community,
  Safety, Delete Account, Changelog, canonical legacy legal routes and custom 404.
- Real App mark, six identity-free actual Beta/Release screenshots, same-origin
  HTML-rendered 1200×630 Open Graph image and canonical download QR.
- First-screen desktop / 390 px / 320 px review: slogan, description and Android
  CTA visible; no horizontal overflow. Real screenshot gallery and download,
  maintenance, WeChat, safety and 404 screens visually reviewed.
- Metadata points at independently verified 1.4.0+7 public assets. Authoritative
  SHA-256: `982db20caaeefd90caedbbc125ec5f11c9cb2d463f302cb8b5bda43e2164cb82`.
- The backend was paused during this check. The download page clearly says
  registration, login and online content are temporarily unavailable. This report
  does **not** claim the service is ready for user registration.
- No automatic WeChat invite claim and no unverified receiving email address.

## Automated checks

- Static check: 12 documents, 256 local links/assets, metadata schema, fixed
  GitHub asset origin, canonical URLs, no trackers and unverified-release gate.
- Chromium and Edge: all 9 routes at 320×568, 360×800, 390×844, 430×932,
  768×1024 and 1440×1000; WeChat/Android/iOS behavior; keyboard activation;
  FAQ; 200% text; explicit reduced-motion style assertions.
- axe WCAG 2 A/AA and 2.1 AA: zero violations across all 9 routes at 390 and
  1440 px in the Chromium-family acceptance runs.
- WebKit: all 58 route/viewport/UA/interaction acceptance cases passed locally.
- Firefox Windows engine failed before launch: Windows SideBySide cannot resolve
  the downloaded engine's `mozglue` assembly. This is **not Firefox PASS**.
  The read-only Linux CI workflow must establish full three-engine PASS after
  integration. No host runtime, registry or browser binary was modified to bypass it.
- `site-qa.yml` runs Chromium, Firefox and WebKit on Linux, plus static output drift
  and Lighthouse. It cannot upload releases or deploy Pages.

| Mobile Lighthouse | Performance | Accessibility | Best practices | SEO | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Home | 100 | 100 | 100 | 100 | 904 ms | 0 |
| Download | 100 | 100 | 100 | 100 | 1059 ms | 0 |

These are local simulated-mobile measurements, not promises about every public
network. The download result followed replacing a 908 KB legacy icon request with
an optimized WebP derived from the same real brand asset; the old asset is retained.
Tablet orbit overflow and 200% text navigation overflow were fixed and retested.

WebKit uses the system keyboard preference for first-Tab traversal. Its test
focuses the native skip anchor and then verifies Enter activation and destination.
Chromium and Firefox additionally assert first-Tab discovery. See the
[upstream WebKit keyboard preference discussion](https://github.com/microsoft/playwright/issues/5609).

## Evidence and live acceptance

Local evidence (not committed, no private account data):

- `qa-artifacts/desktop-home.png`, `mobile-home.png`
- `qa-artifacts/hero-1440.png`, `hero-390.png`, `hero-320.png`
- `qa-artifacts/desktop-download.png`, `mobile-download.png`
- `qa-artifacts/desktop-safety.png`, `mobile-safety.png`
- `qa-artifacts/wechat-mode.png`, `desktop-not-a-page.png`
- `qa-artifacts/lighthouse-home.{json,html}`
- `qa-artifacts/lighthouse-download.{json,html}`
- `qa-artifacts/edge-results.txt`, `chromium-results.txt`, `webkit-results.txt`

After publication:

```powershell
node scripts/public-check.mjs
node scripts/qa.mjs --live
```

The live suite uses only fixed `https://lastar.me`, records `live-*` evidence,
visits pages without downloading APKs or writing to any backend, and has the
same acceptance assertions as the local suite. Real WeChat WebView and iPhone
testing remains distinct from desktop browser UA emulation.

Only after public pages/assets, metadata, current APK integrity and backend
readiness are verified may the release operator complete Beta app_config cutover.
