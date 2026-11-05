from pathlib import Path
import hashlib
import json
import shutil

root = Path(__file__).resolve().parents[1]
source = root / '.after-school-import'
cities = ('almaty', 'astana', 'karaganda', 'shymkent', 'uralsk', 'temirtau')
for item in json.loads((source / 'manifest.json').read_text()):
    data = b''.join((source / part).read_bytes() for part in item['parts'])
    assert hashlib.sha256(data).hexdigest() == item['sha256'], item['name']
    for city in cities:
        target = root / 'sites' / city / 'after-school/assets/programs' / item['name']
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
shutil.rmtree(source)
(root / '.github/workflows/import-after-school-assets.yml').unlink()
