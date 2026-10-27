"""Fetch credited public reference media; preserve originals outside the public site."""
from pathlib import Path
from urllib.request import Request, urlopen
from PIL import Image, ImageOps
import json

root = Path(__file__).resolve().parents[1]
source = root / 'Portfolio Content' / 'Reference Media'
output = root / 'public' / 'media'
source.mkdir(parents=True, exist_ok=True)
items = {
    'botbrawl-logo': {
        'url': 'https://botbrawl.ca/static/img/logo-640.png',
        'filename': 'botbrawl-logo.png',
        'sourcePage': 'https://botbrawl.ca/',
        'credit': 'BotBrawl Canada',
    },
    'fio-logo': {
        'url': 'https://static.wixstatic.com/media/1bac70_05799c777e444b8897d0f141077f41e7~mv2.png',
        'filename': 'fio-logo.png',
        'sourcePage': 'https://www.futabanorthamerica.com/ontario',
        'credit': 'FIO Automotive Canada / Futaba North America',
    },
    'botbrawl-fight': {
        'url': 'https://botbrawl.ca/uploads/articles/article_body_2f875e0022.jpg',
        'filename': 'botbrawl-nv-cyclone.jpg',
        'sourcePage': 'https://botbrawl.ca/blog/recap-summer-classic-26',
        'credit': 'Liam Haddock / BotBrawl Canada',
    },
    'botbrawl-nv': {
        'url': 'https://botbrawl.ca/uploads/articles/article_body_5f00f68601.jpg',
        'filename': 'botbrawl-nv.jpg',
        'sourcePage': 'https://botbrawl.ca/blog/recap-summer-classic-26',
        'credit': 'Eric Laird / BotBrawl Canada',
    },
    'botbrawl-crowd': {
        'url': 'https://botbrawl.ca/uploads/articles/article_body_da22bea28b.jpg',
        'filename': 'botbrawl-arena-crowd.jpg',
        'sourcePage': 'https://botbrawl.ca/blog/recap-summer-classic-26',
        'credit': 'Liam Haddock / BotBrawl Canada',
    },
    'botbrawl-shrubert': {
        'url': 'https://botbrawl.ca/uploads/articles/article_body_086b3c3fcf.jpg',
        'filename': 'botbrawl-shrubert-jak3.jpg',
        'sourcePage': 'https://botbrawl.ca/blog/recap-summer-classic-26',
        'credit': 'Liam Haddock / BotBrawl Canada',
    },
}
manifest_path = root / 'src' / 'data' / 'media.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
for key, info in items.items():
    original_path = source / info['filename']
    if not original_path.exists():
        with urlopen(Request(info['url'], headers={'User-Agent': 'EliasPortfolio-MediaPreparation/1.0'}), timeout=45) as response:
            original_path.write_bytes(response.read())
    with Image.open(original_path) as original:
        oriented = ImageOps.exif_transpose(original)
        if key.endswith('-logo'):
            rgba = oriented.convert('RGBA')
            image = Image.new('RGB', rgba.size, '#18212b' if key == 'botbrawl-logo' else 'white')
            image.paste(rgba, mask=rgba.getchannel('A'))
        else:
            image = oriented.convert('RGB')
        entry = {'source': 'Reference Media/' + info['filename'], 'width': image.width, 'height': image.height, 'variants': {}}
        for width in (640, 1400):
            copy = image.copy()
            copy.thumbnail((width, width * 2), Image.Resampling.LANCZOS)
            filename = f'{key}-{width}.webp'
            copy.save(output / filename, 'WEBP', quality=90, method=6, lossless=key.endswith('-logo'))
            entry['variants'][str(width)] = {'file': filename, 'width': copy.width, 'height': copy.height}
        manifest[key] = entry
    print(f'{key}: {image.width} x {image.height}')
manifest_path.write_text(json.dumps(manifest, indent=2), encoding='utf-8')
(root / 'src' / 'data' / 'reference-media.json').write_text(json.dumps(items, indent=2), encoding='utf-8')
