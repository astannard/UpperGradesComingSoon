// Renders intro.html to PNG frames with alpha, then encodes the videos.
// Usage: node intro/render.js [--stills t1,t2,...]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const dir = __dirname;
const framesDir = path.join(dir, 'frames');
const outDir = path.join(dir, 'output');

(async () => {
  const stillsArg = process.argv.indexOf('--stills');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.join(dir, 'intro.html'));

  const save = async (file, expr, ...args) => {
    const url = await page.evaluate(expr, ...args);
    fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
  };

  if (stillsArg > -1) {
    fs.mkdirSync(outDir, { recursive: true });
    for (const t of process.argv[stillsArg + 1].split(',').map(Number)) {
      await save(path.join(outDir, `still-${t.toFixed(2)}.png`),
        t => window.renderFrame(Math.round(t * window.FPS), 1), t);
    }
    await browser.close();
    return;
  }

  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir, { recursive: true });
  fs.mkdirSync(outDir, { recursive: true });
  const frames = await page.evaluate(() => window.FRAMES);
  const fps = await page.evaluate(() => window.FPS);
  for (let i = 0; i < frames; i++) {
    await save(path.join(framesDir, `f${String(i).padStart(4, '0')}.png`), i => window.renderFrame(i), i);
  }
  await browser.close();

  const input = ['-y', '-framerate', String(fps), '-i', path.join(framesDir, 'f%04d.png')];
  const ff = args => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' });
  // Transparent: ProRes 4444 (Premiere/Final Cut/CapCut desktop) and VP9 WebM (web)
  ff([...input, '-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le',
      '-alpha_bits', '16', path.join(outDir, 'uppergrades-intro-transparent.mov')]);
  ff([...input, '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '18',
      '-auto-alt-ref', '0', path.join(outDir, 'uppergrades-intro-transparent.webm')]);
  // Black background H.264 MP4 (TikTok, Reels, Shorts)
  ff([...input, '-filter_complex', `color=black:s=1080x1920:r=${fps}[bg];[bg][0:v]overlay=shortest=1,format=yuv420p`,
      '-c:v', 'libx264', '-crf', '14', '-preset', 'slow', '-movflags', '+faststart',
      path.join(outDir, 'uppergrades-intro-black.mp4')]);
  console.log(`Rendered ${frames} frames @ ${fps}fps`);
})();
