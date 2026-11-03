"""Create an ignored contact sheet to inspect the November source additions."""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

root = Path(__file__).resolve().parents[1]
source = root / 'Portfolio Content'
names = [
    'Cool Photo of Baker Bot.jpeg', 'Cool Baker Bot Head.jpeg',
    'WE FIRST Bot Brawl Meeting.jpeg', 'CAD of Saw Axe Combat Robot Clutch Concept.jpeg',
    'Weather Lights with Enclosure.jpeg', 'Ri3D Brainstorming (2).jpeg',
    'Ri3D Building (1).jpeg', 'Ri3D Building (2).jpeg', 'Ri3D Building (3).jpeg',
    'Ri3D Building (4).jpeg', 'Ri3D Testing.jpeg', 'Hiking in the Alps (1).jpeg',
    'Hiking in the Alps (2).jpeg', 'Alps Cool Photo.jpeg',
    'Climbing in Squamish (1).jpeg', 'Climbing in Squamish (2).jpeg', 'Guitar.jpeg',
]
for batch in range(0, len(names), 9):
    selected = names[batch:batch + 9]
    sheet = Image.new('RGB', (1260, 1005), '#1a1e23')
    draw = ImageDraw.Draw(sheet)
    for index, name in enumerate(selected):
        with Image.open(source / name) as original:
            photo = ImageOps.exif_transpose(original).convert('RGB')
            photo.thumbnail((400, 285))
            x, y = (index % 3) * 420, (index // 3) * 335
            sheet.paste(photo, (x + (420 - photo.width) // 2, y))
            draw.text((x + 10, y + 290), name, fill='white')
    destination = source / 'Generated Media' / f'november-media-review-{batch // 9 + 1}.jpg'
    sheet.save(destination, quality=88)
    print(destination)
