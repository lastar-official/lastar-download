# LaStar website-only release

Source: lastar-greenfield aa8f94f3df73e7ec626b8a525cb57ba8ace49090.

Next compiles the templates/metadata. The public information site uses tiny first-party progressive enhancement, without App Router hydration. Do not run the old scripts/build.mjs or edit content to rebuild this release. The read-only Website quality workflow verifies the reviewed static manifest.

App, Web client, admin and public trends are NOT published. No APK was uploaded or replaced.

Rollback point: 4cbc5b12e5a8501048636249895f6c3a530aa715 (same tree as original snapshot d0b29ac206c2732f4722e8af029e494c973d7622). Preserve all existing Releases and release-meta.json. If the website fails, revert the website release commit on main with a new normal commit; never force-push or dispatch assemble-release.yml. The complete pre-release bundle and recovered checkout are retained locally.
