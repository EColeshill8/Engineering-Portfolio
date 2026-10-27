"""Create web copies without changing source photographs. Requires Pillow."""
from pathlib import Path
from PIL import Image, ImageOps
import argparse, json

parser = argparse.ArgumentParser()
parser.add_argument('source', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
out = root / 'public' / 'media'
out.mkdir(parents=True, exist_ok=True)
names = {
 '6502': '6502 Computer.jpeg', 'ski': 'Alpine Ski Racing.jpeg',
 'baker-bot': 'Baker Bot (1).jpeg', 'baker-head': 'Baker Bot Head Part.jpeg',
 'frc-team': 'FRC 2024 Team.jpeg', 'frc-competition': 'FRC Newmarket Competition.jpeg',
 'frc-robot': 'FRC Robot 2024.jpeg', 'nepal': 'Hiking Himilayas.jpeg',
 'rockies': 'Hiking in the Rockies.jpeg', 'award': 'Lady Godiva Award in Engineering.jpeg',
 'ec-logo': 'Makers Mark - Logo.jpeg', 'biking': 'Mountain Biking.jpeg',
 'minibot-remote': 'PID Driving Robot (1).jpeg', 'minibot': 'PID Driving Robot (2).jpeg',
 'ri3d-cad': 'Ri3D (2026) CAD.png', 'ri3d-cad-alt': 'Ri3D (2026) CAD).png',
 'ri3d-brainstorm': 'Ri3D Brainstorming.jpeg', 'ri3d-team': 'Ri3D team (2026).jpeg',
 'vex': 'VEX V5 Kiwi-Drive (2024).jpeg', 'recruiting': 'WE FIRST Recruiting.jpeg',
 'workshop': 'WE FIRST Soldering Workshop (1).jpeg', 'workshop-2': 'WE FIRST Soldering Workshop (2).jpeg',
 'weather-board': 'Weather Lights Circuit Board.jpeg', 'wec-2024': 'WEC (2024).jpeg',
 'wec-team': 'WEC Senior (2025) Podium.jpeg', 'wec-build': 'WEC Senior (2025) Robot Assembly.jpeg',
 'wec-robot': 'WEC Senior (2025) Robot.jpeg',
 'combat-clutch': 'Saw Axe Combat Robot Clutch Idea.JPG'
}
manifest_path = root / 'src' / 'data' / 'media.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8')) if manifest_path.exists() else {}
for key, name in names.items():
    with Image.open(args.source / name) as original:
        image = ImageOps.exif_transpose(original).convert('RGB')
        item = {'source': name, 'width': image.width, 'height': image.height, 'variants': {}}
        for width in [640, 1400]:
            copy = image.copy()
            copy.thumbnail((width, width * 2), Image.Resampling.LANCZOS)
            filename = f'{key}-{width}.webp'
            copy.save(out / filename, 'WEBP', quality=84, method=6)
            item['variants'][str(width)] = {'file': filename, 'width': copy.width, 'height': copy.height}
        manifest[key] = item
        if key == 'ec-logo':
            image.thumbnail((256, 256), Image.Resampling.LANCZOS)
            image.save(root / 'public' / 'favicon.png')
(root / 'src' / 'data' / 'media.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
print(f'Prepared {len(manifest)} images / {sum(p.stat().st_size for p in out.iterdir()) / 1048576:.1f} MiB')
