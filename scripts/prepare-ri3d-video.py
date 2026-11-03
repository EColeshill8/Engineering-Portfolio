"""Prepare the supplied RI3D highlight clip without changing its original."""
from pathlib import Path
from PIL import Image, ImageDraw
import argparse, hashlib, json, re, subprocess

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--ffmpeg', type=Path, required=True)
args = parser.parse_args()
source = root / 'Portfolio Content' / 'Ri3D Final Copy.mov'
generated = root / 'Portfolio Content' / 'Generated Media'
generated.mkdir(parents=True, exist_ok=True)
destination = root / 'public' / 'videos' / 'ri3d-build-highlights.mp4'

def run(arguments):
    return subprocess.run([str(args.ffmpeg), '-hide_banner', '-loglevel', 'error', '-y', *map(str, arguments)], check=True, capture_output=True)

run(['-i', source, '-map', '0:v:0', '-an', '-sn', '-dn',
     '-vf', "scale=w='min(1280,iw)':h='min(1280,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2,setsar=1,fps=30",
     '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p',
     '-map_metadata', '-1', '-movflags', '+faststart', destination])
probe = subprocess.run([str(args.ffmpeg), '-hide_banner', '-i', str(destination)], capture_output=True, text=True)
match = re.search(r'Duration: (\d+):(\d+):([\d.]+)', probe.stderr)
hours, minutes, seconds = map(float, match.groups())
duration = hours * 3600 + minutes * 60 + seconds
poster_path = generated / 'ri3d-highlight-poster.png'
run(['-ss', str(duration * .2), '-i', destination, '-frames:v', '1', poster_path])
manifest_path = root / 'src/data/media.json'
media = json.loads(manifest_path.read_text(encoding='utf-8'))
with Image.open(poster_path) as poster:
    width, height = poster.size
    entry = {'source':'Generated Media/' + poster_path.name,'width':width,'height':height,'variants':{}}
    for size in (640, 1400):
        image = poster.copy()
        image.thumbnail((size, size * 2), Image.Resampling.LANCZOS)
        filename = f'ri3d-highlight-poster-{size}.webp'
        image.save(root / 'public/media' / filename, 'WEBP', quality=88, method=6)
        entry['variants'][str(size)] = {'file':filename,'width':image.width,'height':image.height}
    media['ri3d-highlight-poster'] = entry
manifest_path.write_text(json.dumps(media, indent=2), encoding='utf-8')
video_path = root / 'src/data/videos.json'
videos = json.loads(video_path.read_text(encoding='utf-8'))
videos['ri3d-build-highlights'] = {
    'file':destination.name,'poster':'ri3d-highlight-poster','source':source.name,
    'width':width,'height':height,'durationSeconds':duration,'fps':30,
    'bytes':destination.stat().st_size,'sha256':hashlib.sha256(destination.read_bytes()).hexdigest(),
    'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'codec':'H.264 / yuv420p','audio':False,
}
video_path.write_text(json.dumps(videos, indent=2), encoding='utf-8')
sheet = Image.new('RGB', (1200, 440), '#1b2024')
draw = ImageDraw.Draw(sheet)
for index, fraction in enumerate((.1,.5,.9)):
    frame_path = generated / f'ri3d-video-review-{index}.png'
    run(['-ss', str(duration * fraction), '-i', destination, '-frames:v', '1', frame_path])
    with Image.open(frame_path) as frame:
        frame.thumbnail((390, 400), Image.Resampling.LANCZOS)
        sheet.paste(frame, (index * 400 + (400 - frame.width)//2, 25))
    draw.text((index*400+10,5), f'{duration*fraction:.1f} seconds', fill='white')
sheet.save(generated / 'ri3d-video-review.jpg', quality=90)
print(f'Prepared RI3D highlights: {width}x{height}, {duration:.1f}s, {destination.stat().st_size:,} bytes')
