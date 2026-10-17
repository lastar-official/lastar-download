# LaStar website-only release

Source: lastar-greenfield 93233eeeee56eb6cc4dedc8cb9774e78d1925bcc.

This repository hosts a reviewed static export. Do not run the old scripts/build.mjs or edit content to rebuild this release. The read-only Website quality workflow verifies the checked-in static manifest.

App, Web client, admin and public trends are NOT published. No APK was uploaded or replaced.

Rollback point: d0b29ac206c2732f4722e8af029e494c973d7622. Preserve all existing Releases and release-meta.json. If the website fails, revert the website release commit on main with a new normal commit; never force-push or dispatch assemble-release.yml. The complete pre-release bundle and recovered checkout are retained locally.
