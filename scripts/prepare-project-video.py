"""Create a silent, streamable web clip and poster while preserving source media."""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import argparse
import hashlib
import json
import re
import shutil
import subprocess

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--ffmpeg', type=Path)
args = parser.parse_args()
candidates = list((root / '.tools/python/imageio_ffmpeg/binaries').glob('ffmpeg*.exe'))
ffmpeg = str(args.ffmpeg or shutil.which('ffmpeg') or (candidates[0] if candidates else ''))
if not ffmpeg:
    raise SystemExit('Install FFmpeg or provide --ffmpeg PATH. See README.md.')

source = root / 'Portfolio Content' / 'Baker Bot Head Moving Test.mp4'
output = root / 'public' / 'videos'
generated = root / 'Portfolio Content' / 'Generated Media'
output.mkdir(parents=True, exist_ok=True)
generated.mkdir(parents=True, exist_ok=True)
clip = output / 'baker-head-test.mp4'

def run(arguments):
    return subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', *map(str, arguments)], check=True, capture_output=True)

# FFmpeg applies the phone's rotation metadata before scaling. Do not upscale.
run(['-i', source, '-map', '0:v:0', '-an', '-sn', '-dn',
     '-vf', "scale=w='min(1280,iw)':h='min(1280,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2,setsar=1,fps=30",
     '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p',
     '-profile:v', 'high', '-level:v', '4.0', '-map_metadata', '-1', '-movflags', '+faststart', clip])

poster_path = generated / 'baker-head-test-poster.png'
run(['-ss', '2', '-i', clip, '-frames:v', '1', poster_path])
manifest_path = root / 'src/data/media.json'
media = json.loads(manifest_path.read_text(encoding='utf-8'))
with Image.open(poster_path) as source_poster:
    poster = ImageOps.exif_transpose(source_poster).convert('RGB')
    width, height = poster.size
    entry = {'source': 'Generated Media/' + poster_path.name, 'width': width, 'height': height, 'variants': {}}
    for size in (640, 1400):
        image = poster.copy()
        image.thumbnail((size, size * 2), Image.Resampling.LANCZOS)
        filename = f'baker-head-test-poster-{size}.webp'
        image.save(root / 'public/media' / filename, 'WEBP', quality=88, method=6)
        entry['variants'][str(size)] = {'file': filename, 'width': image.width, 'height': image.height}
    media['baker-head-test-poster'] = entry
manifest_path.write_text(json.dumps(media, indent=2), encoding='utf-8')

probe = subprocess.run([ffmpeg, '-hide_banner', '-i', str(clip)], capture_output=True, text=True)
match = re.search(r'Duration: (\d+):(\d+):([\d.]+)', probe.stderr)
hours, minutes, seconds = map(float, match.groups())
duration = hours * 3600 + minutes * 60 + seconds
info = {
    'file': clip.name, 'poster': 'baker-head-test-poster', 'source': source.name,
    'width': width, 'height': height, 'durationSeconds': duration, 'fps': 30,
    'bytes': clip.stat().st_size, 'sha256': hashlib.sha256(clip.read_bytes()).hexdigest(),
    'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
    'codec': 'H.264 / yuv420p', 'audio': False,
}
(root / 'src/data/videos.json').write_text(json.dumps({'baker-head-test': info}, indent=2), encoding='utf-8')

# Small frame samples for human review; none of these originals are deployed.
sheet = Image.new('RGB', (4 * 250, 470), '#18212b')
draw = ImageDraw.Draw(sheet)
for index, time in enumerate((1, 10, 20, 30)):
    frame_path = generated / f'baker-head-review-{time}.png'
    run(['-ss', str(time), '-i', clip, '-frames:v', '1', frame_path])
    with Image.open(frame_path) as frame:
        frame.thumbnail((240, 430), Image.Resampling.LANCZOS)
        sheet.paste(frame, (index * 250 + (250-frame.width)//2, 25))
    draw.text((index * 250 + 10, 7), f'{time} seconds', fill='white')
sheet.save(generated / 'baker-head-review.jpg', quality=90)
print(f'Prepared {clip.name}: {width}x{height}, {duration:.2f}s, {info["bytes"]:,} bytes, silent H.264.')
