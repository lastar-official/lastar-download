"""Pinned, manual RC1 transport: verify before any final asset upload."""
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile
import urllib.request

REPO = "lastar-official/lastar-download"
TAG = "v1.4.0-beta.1"
SHA256 = "982db20caaeefd90caedbbc125ec5f11c9cb2d463f302cb8b5bda43e2164cb82"
SIZE = 63816206
NAMES = ("LaStar-Beta-v1.4.0.apk", "LaStar-Beta.apk", "LaStar-Beta-RC1-v1.4.0.apk")
PART_HASHES = (
"d3665165b8911757c35bcdb34f254434b18add4df306902f8387b39ccb599a58",
"bd0ff99923e3f667431cf72005d22e15043e22529891b64c400bf455f83aaeef",
"6909573dfddf95e88d087bd8b625099c721ec836245edae247148c5d0398c2fa",
"d72e802f6117603879fca63173eab0b7432e11449e03eaf08212542c463c1ae0",
"c2a435325b70657e4399647cb35d5b50e62605a4b912783288661273bf181f20",
"ca86e924f700d5532e5813996818d2f796ecacba8a69c9a4a82967e8a3dd5665",
"e0e51c4bc6558c8e9c2adf72cffc479e5d4bfd8565fb4ac889492044dd3fa426",
"530c0e4661ed1f99cee6f2f92ae8f0dd660cf5648f61b0c5501c96085eaaa79d",
"2bf11db9762a69f5b6956086f1ed4362f96aac0712b4e0ebc27b512d0efef50c",
"c0544e6e6ee248f4c6ab7ff129c5b3e1a665a725c419c26ad0b48a302f6e5da4",
"01ccaba515759b9456773587a48fe15589d016b07563c5a5a02cc4e27396a877",
"a3b522cf83424de57804609e12c1d2e7070d633a9a0ea5fcd742cc75edb7de18",
"b636755af38e0bb0c7facb07830d3335f9f714db7c65005bc6bb5c479d9d9af4",
"d10b47b7d9ffb927fb4f99514cb17867358c3e28696c6ec8c6b77b0f372e162d",
"cb37c19650e8542a24b2f3a73fdfbbfcb7a0c17304df5bc0c541c8cb1f77d8b0",
"d3493acdf31df3c5149ed6db2d2989e83e98fe9249c4bf1216df4af0b548ddbd",
)


def gh(*args):
    return subprocess.check_output(["gh", *args], text=True)


def digest(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def release():
    data = json.loads(gh("api", f"repos/{REPO}/releases/tags/{TAG}"))
    if data["tag_name"] != TAG or data["draft"]:
        raise RuntimeError("Pinned public release is unavailable")
    return data


def public_download(name, destination):
    if name not in NAMES:
        raise RuntimeError("Asset name is outside the approval")
    url = f"https://github.com/{REPO}/releases/download/{TAG}/{name}"
    request = urllib.request.Request(url, headers={"User-Agent": "LaStar-RC1-integrity"})
    # No Authorization header: this verifies the actual public user route.
    with urllib.request.urlopen(request, timeout=120) as response, destination.open("wb") as target:
        if response.status != 200:
            raise RuntimeError("Public download did not return HTTP 200")
        while block := response.read(1024 * 1024):
            target.write(block)
    if destination.stat().st_size != SIZE or digest(destination) != SHA256:
        raise RuntimeError(f"Public asset integrity mismatch: {name}")


def main():
    if (os.environ.get("GITHUB_REPOSITORY") != REPO
            or os.environ.get("GITHUB_EVENT_NAME") != "workflow_dispatch"
            or os.environ.get("GITHUB_REF") != "refs/heads/main"):
        raise RuntimeError("Only manual dispatch from the approved repository main is allowed")
    with tempfile.TemporaryDirectory(prefix="lastar-rc1-") as directory:
        root = Path(directory)
        existing = {asset["name"]: asset for asset in release()["assets"]}
        completed = set()
        # Inspect ALL same-name assets before uploading any. Never clobber.
        for name in NAMES:
            if name in existing:
                public_download(name, root / ("existing-" + name))
                completed.add(name)

        if len(completed) != len(NAMES):
            incoming = root / "parts"
            incoming.mkdir()
            assembled = root / "verified.apk"
            with assembled.open("wb") as output:
                for index, expected in enumerate(PART_HASHES):
                    name = f"rc1-982db20c.part-{index:03}"
                    if name not in existing:
                        raise RuntimeError(f"Required transport part missing: {name}")
                    gh("release", "download", TAG, "--repo", REPO,
                       "--pattern", name, "--dir", str(incoming))
                    part = incoming / name
                    expected_size = 4194304 if index < 15 else 901646
                    if part.stat().st_size != expected_size or digest(part) != expected:
                        raise RuntimeError(f"Transport part integrity mismatch: {name}")
                    with part.open("rb") as source:
                        while block := source.read(1024 * 1024):
                            output.write(block)
            if assembled.stat().st_size != SIZE or digest(assembled) != SHA256:
                raise RuntimeError("Assembled APK mismatch; upload prohibited")
            for name in NAMES:
                if name in completed:
                    continue
                destination = root / name
                # Exact byte copy only; never build, align, patch or re-sign.
                with assembled.open("rb") as source, destination.open("wb") as target:
                    while block := source.read(1024 * 1024):
                        target.write(block)
                gh("release", "upload", TAG, "--repo", REPO, str(destination))

        # Re-download all public assets into fresh paths BEFORE transport cleanup.
        public = root / "public"
        public.mkdir()
        for name in NAMES:
            public_download(name, public / name)
            print(f"PUBLIC_SHA_PASS {name} {SHA256}")
        remaining = {asset["name"] for asset in release()["assets"]}
        for index in range(len(PART_HASHES)):
            name = f"rc1-982db20c.part-{index:03}"
            if name in remaining:
                gh("release", "delete-asset", TAG, name, "--repo", REPO, "--yes")
        print("RC1_ASSETS_VERIFIED; temporary transport parts removed")


if __name__ == "__main__":
    main()
