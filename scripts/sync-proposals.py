"""Mirror the proposals directory at the exact revision used by the episode feed."""
import hashlib
import io
import json
import os
from pathlib import Path
import re
import tarfile
import tempfile
from urllib.request import urlopen

root = Path(__file__).resolve().parents[1]
feed = json.loads((root / "data/evolution.json").read_text())
commit = feed["commit"]
if not re.fullmatch(r"[a-f0-9]{40}", commit):
    raise ValueError("Invalid feed commit")

with urlopen(f"https://api.github.com/repos/swiftlang/swift-evolution/git/trees/{commit}?recursive=1", timeout=60) as res:
    tree = json.load(res)
if tree["truncated"] or tree["sha"] != commit:
    raise ValueError("Incomplete upstream tree")
expected = {e["path"]: e["sha"] for e in tree["tree"]
            if e["type"] == "blob" and e["path"].startswith("proposals/")}
for proposal in feed["proposals"]:
    if expected.get("proposals/" + proposal["link"]) != proposal["sha"]:
        raise ValueError(f"Feed and source disagree for {proposal['id']}")


def digest(data):
    return hashlib.sha1(f"blob {len(data)}\0".encode() + data).hexdigest()


def matches(name):
    file = root / "data" / name
    return file.is_file() and digest(file.read_bytes()) == expected[name]


missing = {name for name in expected if not matches(name)}
if missing:
    with urlopen(f"https://codeload.github.com/swiftlang/swift-evolution/tar.gz/{commit}", timeout=120) as res:
        with tarfile.open(fileobj=io.BytesIO(res.read()), mode="r:gz") as archive:
            for name in sorted(missing):
                data = archive.extractfile(f"swift-evolution-{commit}/{name}").read()
                if digest(data) != expected[name]:
                    raise ValueError(f"Content mismatch for {name}")
                target = root / "data" / name
                target.parent.mkdir(parents=True, exist_ok=True)
                with tempfile.NamedTemporaryFile(dir=target.parent, delete=False) as tmp:
                    tmp.write(data)
                os.replace(tmp.name, target)
if not all(matches(name) for name in expected):
    raise ValueError("Local source verification failed")
print(f"원문·참고 파일 {len(expected)}개 검증 완료 · 새로 저장 {len(missing)}개")
