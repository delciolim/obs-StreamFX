#!/usr/bin/env python3
"""
Cinematic vertical worship video generator.
Crops 1920x1080 clips to 1080x1920 (9:16), applies warm color grade,
slow motion, crossfade transitions, and typography overlays.
"""
import subprocess
import os
import sys

UPLOAD_DIR = "/root/.claude/uploads/6ce4ed8c-3427-4534-8a5c-f9f9caaa37fc"
OUTPUT_DIR = "/home/user/obs-StreamFX/output"
WORK_DIR = "/tmp/worship_video"
FONT = "/usr/share/fonts/truetype/open-sans/OpenSans-ExtraBold.ttf"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(WORK_DIR, exist_ok=True)

TRANSITION_DUR = 1.0  # crossfade seconds

# (filename, target_duration_s, slowmo_0.5x, start_offset_s)
CLIPS = [
    ("ea1c609b-MVI_9169.MP4", 6, False, 1.0),
    ("aca9c0c6-MVI_9170.MP4", 5, True,  1.0),
    ("1f729b4b-MVI_9171.MP4", 5, False, 1.0),
    ("b44d396a-MVI_9175.MP4", 5, False, 1.0),
    ("5588d0fd-MVI_9176.MP4", 5, False, 0.0),
    ("1bbba770-MVI_9179.MP4", 6, True,  1.0),
    ("fcc84515-MVI_9181.MP4", 5, False, 1.0),
    ("1e10cf29-MVI_9182.MP4", 5, True,  1.0),
    ("72c73739-MVI_9183.MP4", 6, False, 1.0),
    ("952c8491-MVI_9184.MP4", 5, True,  1.0),
    ("c6a20e74-MVI_9185.MP4", 5, False, 1.0),
    ("3f626772-MVI_9188.MP4", 5, True,  0.0),  # very short clip – full slow-mo
    ("35aff095-MVI_9189.MP4", 5, False, 1.0),
    ("bbaee6bc-MVI_9190.MP4", 6, False, 2.0),
    ("efd93870-MVI_9192.MP4", 5, False, 1.0),
    ("8754a375-MVI_9193.MP4", 5, False, 1.0),
]

DURATIONS = [c[1] for c in CLIPS]

# Warm cinematic color grade:
# – red channel lifted/boosted → golden highlight
# – green slight reduction → richer skin tones
# – blue heavily reduced → eliminates coolness, adds warmth
# – vignette draws eye to center
COLOR_GRADE = (
    "eq=brightness=0.05:contrast=1.15:saturation=1.25,"
    "curves="
        "r='0/0 0.1/0.15 0.5/0.58 0.9/0.95 1/1':"
        "g='0/0 0.1/0.10 0.5/0.47 0.9/0.90 1/0.93':"
        "b='0/0 0.1/0.05 0.5/0.35 0.9/0.80 1/0.83',"
    "vignette=angle=PI/5"
)


def run_cmd(cmd, label=""):
    print(f"  → {label or os.path.basename(cmd[0])}", flush=True)
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"  FAILED:\n{r.stderr[-1200:]}", file=sys.stderr)
        return False
    return True


# ─── Step 1: Pre-process each clip ───────────────────────────────────────────
print("=" * 60)
print("Step 1: Processing individual clips")
print("=" * 60)

processed = []
for i, (fname, dur, slowmo, ss) in enumerate(CLIPS):
    out = os.path.join(WORK_DIR, f"clip_{i:02d}.mp4")
    if os.path.exists(out):
        print(f"[{i:02d}] {fname}  → cached")
        processed.append(out)
        continue

    inp = os.path.join(UPLOAD_DIR, fname)
    print(f"[{i:02d}] {fname}  dur={dur}s  slowmo={slowmo}  ss={ss}s")

    crop_scale = "crop=608:1080:656:0,scale=1080:1920"

    if slowmo:
        # Read dur/2 seconds from source, stretch 2× with setpts
        src_dur = dur / 2.0
        vf = f"{crop_scale},setpts=2.0*PTS,{COLOR_GRADE}"
        cmd = [
            "ffmpeg", "-y",
            "-ss", str(ss), "-t", str(src_dur), "-i", inp,
            "-vf", vf,
            "-an",
            "-r", "25",
            "-c:v", "libx264", "-preset", "fast", "-crf", "20",
            out,
        ]
    else:
        vf = f"{crop_scale},{COLOR_GRADE}"
        cmd = [
            "ffmpeg", "-y",
            "-ss", str(ss), "-t", str(dur), "-i", inp,
            "-vf", vf,
            "-an",
            "-r", "25",
            "-c:v", "libx264", "-preset", "fast", "-crf", "20",
            out,
        ]

    if run_cmd(cmd, f"clip_{i:02d}.mp4"):
        processed.append(out)
    else:
        sys.exit(1)

print(f"\n✓ {len(processed)} clips ready\n")


# ─── Step 2: xfade chain ─────────────────────────────────────────────────────
print("=" * 60)
print("Step 2: Building xfade transition chain")
print("=" * 60)

N = len(processed)
T = TRANSITION_DUR

# Calculate xfade offset for each transition
xfade_offsets = []
cumulative = DURATIONS[0]
for i in range(1, N):
    xfade_offsets.append(cumulative - T)
    cumulative = cumulative + DURATIONS[i] - T

total_dur = cumulative
print(f"Final video duration: {total_dur:.1f}s  ({int(total_dur//60)}m{int(total_dur%60)}s)")

# Build filter_complex video chain
vf_parts = []
for i in range(1, N):
    src1 = "0:v" if i == 1 else f"xf{i-1}"
    dst  = f"xf{i}" if i < N - 1 else "xfchain"
    vf_parts.append(
        f"[{src1}][{i}:v]xfade=transition=fade:"
        f"duration={T}:offset={xfade_offsets[i-1]:.3f}[{dst}]"
    )


# ─── Step 3: Text overlays ────────────────────────────────────────────────────
# Write each word to a temp file (avoids shell-escaping Unicode issues)
FADE_DUR = 1.0  # per-overlay fade duration

# (text, center_time_in_output, font_size)
text_items = [
    ("AVIVAMENTO",        7.5,  90),
    ("PRESENÇA",          15.5, 100),
    ("GLÓRIA",            24.0, 110),
    ("ADORAÇÃO",          32.5, 100),
    ("TRANSFORMAÇÃO",     41.5,  80),
    ("ESPÍRITO SANTO",    53.5,  78),
]

# Write text files
text_files = []
for idx, (word, _, _fs) in enumerate(text_items):
    tf = os.path.join(WORK_DIR, f"text_{idx}.txt")
    with open(tf, "w", encoding="utf-8") as fh:
        fh.write(word)
    text_files.append(tf)

# Build drawtext filter chain (appended after fade in/out)
FADE_IN_END = FADE_DUR
FADE_OUT_START = total_dur - FADE_DUR

post_filters = [
    f"fade=t=in:st=0:d={FADE_IN_END}",
    f"fade=t=out:st={FADE_OUT_START:.3f}:d={FADE_DUR}",
]

for idx, (_, ct, fs) in enumerate(text_items):
    t0 = ct - 1.5           # appear
    t1 = ct + 1.5           # disappear
    fi = t0 + 0.5           # fade-in end
    fo = t1 - 0.5           # fade-out start
    tf = text_files[idx]
    alpha_expr = (
        f"if(lt(t,{t0:.2f}),0,"
        f"if(lt(t,{fi:.2f}),(t-{t0:.2f})/0.5,"
        f"if(lt(t,{fo:.2f}),1,"
        f"if(lt(t,{t1:.2f}),({t1:.2f}-t)/0.5,0))))"
    )
    # Main text (white, bold)
    post_filters.append(
        f"drawtext=fontfile={FONT}:textfile={tf}:"
        f"x=(w-text_w)/2:y=(h-text_h)/2:"
        f"fontsize={fs}:fontcolor=white:"
        f"bordercolor=black@0.6:borderw=3:"
        f"alpha='{alpha_expr}'"
    )
    # Subtle horizontal line above text
    line_y = "(h-text_h)/2 - 18"
    post_filters.append(
        f"drawtext=fontfile={FONT}:text='─────────────────':"
        f"x=(w-text_w)/2:y={line_y}:"
        f"fontsize=22:fontcolor=white@0.6:"
        f"alpha='{alpha_expr}'"
    )

post_vf = ",".join(post_filters)
final_filter = f"[xfchain]{post_vf}[vout]"

filter_complex = ";".join(vf_parts) + ";" + final_filter


# ─── Step 4: Final render ─────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("Step 3: Final render")
print("=" * 60)

output_path = os.path.join(OUTPUT_DIR, "worship_cinematic.mp4")

cmd = ["ffmpeg", "-y"]
for p in processed:
    cmd += ["-i", p]
# Silent audio as the last input (index N)
cmd += ["-f", "lavfi", "-i", "aevalsrc=0:channel_layout=stereo:sample_rate=44100"]

cmd += [
    "-filter_complex", filter_complex,
    "-map", "[vout]",
    "-map", f"{N}:a",
    "-shortest",
    "-c:v", "libx264", "-preset", "medium", "-crf", "17",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "128k",
    "-r", "25",
    "-movflags", "+faststart",
    output_path,
]

print(f"Output: {output_path}")
if run_cmd(cmd, "final render"):
    size_mb = os.path.getsize(output_path) / 1_048_576
    print(f"\n✓ Done!  {output_path}  ({size_mb:.1f} MB  {total_dur:.0f}s)")
else:
    sys.exit(1)
