# Creating Demo GIF/Video for SSR Doctor

This guide explains how to create professional demo animations for the README.

---

## Tools Required

### Option 1: Terminalizer (Recommended for Terminal Demos)

**Installation:**
```bash
npm install -g terminalizer
```

**Usage:**
```bash
# Start recording
terminalizer record demo

# This will:
# 1. Open a new terminal session
# 2. Record all your commands
# 3. Save to demo.yml

# Play back locally
terminalizer play demo

# Generate GIF
terminalizer render demo
```

**Recommended Settings** (`~/.terminalizer/config.yml`):
```yaml
frameDelay: auto
maxIdleTime: 2000
fps: 15
quality: 100
theme:
  background: "#1e1e1e"
  foreground: "#d4d4d4"
cols: 100
rows: 30
```

---

### Option 2: asciinema + agg (For Web-optimized)

**Installation:**
```bash
# Install asciinema
brew install asciinema  # macOS
apt install asciinema   # Linux

# Install agg for GIF conversion
cargo install agg
```

**Usage:**
```bash
# Record
asciinema rec demo.cast

# Convert to GIF
agg demo.cast demo.gif

# Or upload to asciinema.org
asciinema upload demo.cast
```

---

### Option 3: LICEcap (For Any Screen Recording)

**Download:** https://www.cockos.com/licecap/

**Steps:**
1. Open LICEcap
2. Resize recording window
3. Click "Record"
4. Perform demo
5. Click "Stop"
6. Save as `.gif`

---

## Demo Scenarios

### Demo 1: CLI Scanning

**Script:**
```bash
# Clear screen
clear

# Show help
npx ssr-doctor --help

# Navigate to example
cd examples/next-app

# Run scan with output
npx ssr-doctor scan --path ./src

# Show output is colored and formatted
# Wait 2 seconds for effect

# Clear and show JSON output
clear
npx ssr-doctor scan --path ./src --format json

# Show Markdown output
npx ssr-doctor scan --path ./src --format markdown --out report.md
cat report.md
```

**Recording:**
```bash
# Start recording
terminalizer record cli-demo

# Execute script commands manually with pauses
# (allows for natural typing effect)

# Stop recording (Ctrl+D or type 'exit')

# Generate GIF
terminalizer render cli-demo -o cli-demo.gif
```

---

### Demo 2: ESLint Integration

**Script:**
```bash
clear

# Show example file with issues
cat src/components/BadComponent.tsx

# Run ESLint
npx eslint src/components/BadComponent.tsx

# Show errors in terminal

# Run with --fix
npx eslint src/components/BadComponent.tsx --fix

# Show fixed file
cat src/components/BadComponent.tsx
```

**For IDE Demo (VS Code):**

Use **Screen to GIF** or **Kap**:
1. Open VS Code
2. Open `BadComponent.tsx`
3. Show red squiggly lines
4. Hover to show error messages
5. Click "Quick Fix"
6. Show suggestions
7. Apply fix
8. Save file

---

### Demo 3: GitHub Action

**Record PR workflow:**

1. Create a branch with SSR violations
2. Push to GitHub
3. Open PR
4. Show GitHub Actions running
5. Show PR comment with SSR Doctor report
6. Show inline annotations on code

**Tools:**
- **Kap** (macOS): https://getkap.co/
- **ScreenToGif** (Windows): https://www.screentogif.com/
- **Peek** (Linux): https://github.com/phw/peek

---

## Optimization

### Reduce GIF Size

**Using gifsicle:**
```bash
# Install
brew install gifsicle

# Optimize
gifsicle -O3 --colors 256 demo.gif -o demo-optimized.gif

# Lossy compression (smaller file)
gifsicle -O3 --lossy=80 --colors 256 demo.gif -o demo-small.gif
```

**Using gifski (best quality):**
```bash
# Install
brew install gifski

# Convert video to GIF
gifski -o demo.gif --fps 15 demo.mp4
```

### Convert to WebM (Better for Web)

```bash
# Using ffmpeg
ffmpeg -i demo.gif -c:v libvpx-vp9 -b:v 0 -crf 30 demo.webm
```

---

## Hosting

### Option 1: GitHub Assets (Recommended)

```bash
# 1. Upload to a GitHub issue or PR as comment
# 2. Copy the raw URL
# 3. Use in README

# Example:
![CLI Demo](https://user-images.githubusercontent.com/xxxxx/demo.gif)
```

### Option 2: CDN (jsDelivr)

```bash
# Add to repo under docs/demos/
git add docs/demos/cli-demo.gif
git commit -m "docs: add CLI demo GIF"
git push

# Use in README via jsDelivr
![CLI Demo](https://cdn.jsdelivr.net/gh/wangzhe-dev/ssr-doctorjs@main/docs/demos/cli-demo.gif)
```

### Option 3: Imgur

1. Upload to https://imgur.com/
2. Get direct link
3. Use in README

---

## README Integration

### Markdown Syntax

```markdown
## Demo

### CLI Scanning

![SSR Doctor CLI Demo](https://cdn.jsdelivr.net/gh/wangzhe-dev/ssr-doctorjs@main/docs/demos/cli-demo.gif)

**What's happening:**
1. Running `ssr-doctor scan` on the example app
2. Detecting 8 SSR compatibility issues
3. Showing detailed error locations and suggestions

### ESLint Integration

![ESLint Demo](https://cdn.jsdelivr.net/gh/wangzhe-dev/ssr-doctorjs@main/docs/demos/eslint-demo.gif)

**Features shown:**
- ✅ Real-time error detection
- ✅ Hover tooltips with detailed messages
- ✅ Quick fix suggestions
- ✅ Auto-fix capability

### GitHub Action

![GitHub Action Demo](https://cdn.jsdelivr.net/gh/wangzhe-dev/ssr-doctorjs@main/docs/demos/github-action-demo.gif)

**Workflow:**
1. Push code with SSR issues
2. Action runs automatically
3. PR comment shows summary
4. Inline annotations on problematic lines
```

### HTML (for better control)

```html
<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/wangzhe-dev/ssr-doctorjs@main/docs/demos/cli-demo.gif"
       alt="SSR Doctor CLI Demo"
       width="800" />
</p>
```

---

## Best Practices

### Timing

- **Keep it short**: 15-30 seconds max
- **Pause at key moments**: 1-2 seconds on important info
- **Type naturally**: Not too fast or slow
- **End with result**: Show the final output clearly

### Visuals

- **Terminal theme**: Use a clean, high-contrast theme
- **Font size**: Large enough to read (14-16pt)
- **Window size**: 80-100 columns, 24-30 rows
- **Clear screen**: Start fresh for each major step
- **Highlight output**: Use color to draw attention

### Content

- **Show real issues**: Use examples/next-app violations
- **Demonstrate value**: Show before/after
- **Include context**: Brief comment explaining what's happening
- **End with action**: Show what user should do next

---

## Example Recording Script

### CLI Demo (Full Script)

```bash
#!/bin/bash

# Setup
clear
echo "🚀 SSR Doctor CLI Demo"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sleep 2

# Navigate
echo "📁 Opening example Next.js app..."
cd examples/next-app
sleep 1

# Scan
echo ""
echo "🔍 Scanning for SSR compatibility issues..."
echo ""
sleep 1
npx ssr-doctor scan --path ./src

# Pause to show results
sleep 5

# Show markdown output
clear
echo "📄 Generating Markdown report..."
sleep 1
npx ssr-doctor scan --path ./src --format markdown --out ssr-report.md
echo ""
echo "✅ Report saved to ssr-report.md"
sleep 2

# Show snippet of report
echo ""
echo "📋 Report preview:"
echo ""
head -n 20 ssr-report.md
sleep 5

# End
clear
echo "✨ SSR Doctor found and reported 8 issues!"
echo ""
echo "💡 Next steps:"
echo "   1. Review ssr-report.md"
echo "   2. Run 'ssr-doctor fix' to auto-fix"
echo "   3. Manually fix remaining issues"
sleep 5
```

**Record:**
```bash
terminalizer record cli-demo
# Run the script
./cli-demo.sh
# Press Ctrl+D
terminalizer render cli-demo
```

---

## Placeholder for Development

Until you create the actual GIFs, use placeholders:

```markdown
## Demo

> 🎬 **Demo GIFs coming soon!**
>
> For now, try it yourself:
> ```bash
> cd examples/next-app
> npx ssr-doctor scan --path ./src
> ```

<!-- TODO: Add demo GIFs
![CLI Demo](./docs/demos/cli-demo.gif)
![ESLint Demo](./docs/demos/eslint-demo.gif)
![GitHub Action Demo](./docs/demos/github-action-demo.gif)
-->
```

---

## Testing Before Publishing

1. **Check file size**: Keep under 2MB for GitHub
2. **Test on mobile**: Ensure it's viewable on small screens
3. **Verify loop**: Should loop smoothly
4. **Check loading time**: Should load in < 3 seconds
5. **Test on different browsers**: Chrome, Firefox, Safari

---

## Resources

- **Terminalizer**: https://terminalizer.com/
- **asciinema**: https://asciinema.org/
- **Kap**: https://getkap.co/
- **gifski**: https://gif.ski/
- **gifsicle**: https://www.lcdf.org/gifsicle/

---

**Tip**: Record at 2x normal speed, then slow down in post-processing for a snappier feel!
