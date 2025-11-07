# GitHub Marketplace Cover Image Specifications

This document provides detailed specifications for creating the SSR Doctor GitHub Action cover image for the GitHub Marketplace.

---

## 📐 Technical Requirements

### Dimensions
- **Width**: 1280 pixels
- **Height**: 640 pixels
- **Aspect Ratio**: 2:1
- **Format**: PNG (preferred) or JPG
- **File Size**: Maximum 2 MB
- **Filename**: `cover.png`

### File Location
```
/assets/cover.png
```

---

## 🎨 Design Guidelines

### Color Palette

**Primary Colors:**
- **Blue**: `#0066FF` (GitHub Action blue, reliability)
- **Green**: `#22C55E` (Success, validation passing)
- **Red**: `#EF4444` (Errors, violations detected)
- **Dark**: `#1F2937` (Background, text)
- **Light**: `#F9FAFB` (Backgrounds, contrast)

**Accent Colors:**
- **Yellow/Amber**: `#F59E0B` (Warnings)
- **Purple**: `#8B5CF6` (ESLint integration)
- **Slate**: `#64748B` (Secondary text)

### Typography

**Primary Font:** Inter, SF Pro Display, or similar modern sans-serif

**Text Hierarchy:**
1. **Main Title**: "SSR Doctor" - 80-100pt, Bold
2. **Tagline**: "Catch SSR Issues Before Production" - 32-40pt, Regular
3. **Features**: 20-24pt, Medium
4. **Labels**: 16-18pt, Regular

---

## 🖼️ Design Concept Options

### Option 1: Clean & Professional

**Layout:**
```
┌────────────────────────────────────────────────────┐
│                                                    │
│  [Logo/Icon]     SSR Doctor                       │
│                  Catch SSR Issues Before Production│
│                                                    │
│  ✓ Browser API Detection                          │
│  ✓ Hydration Risk Prevention                      │
│  ✓ Next.js Dynamic Import Validation              │
│                                                    │
│  [Screenshot of PR comment or CLI output]         │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Key Elements:**
- Large "SSR Doctor" text at top
- Tagline underneath
- 3 key features with checkmarks
- Screenshot or code snippet showing detection
- GitHub Actions logo/badge in corner

---

### Option 2: Code-Focused

**Layout:**
```
┌────────────────────────────────────────────────────┐
│                                                    │
│  SSR Doctor                                        │
│  Automated SSR Compatibility Checks                │
│                                                    │
│  ┌──────────────────────────────────────┐        │
│  │ ❌ src/components/Header.tsx         │        │
│  │    const width = window.innerWidth;  │        │
│  │                                      │        │
│  │ ✅ Fixed with SSR Doctor             │        │
│  │    useEffect(() => {                │        │
│  │      setWidth(window.innerWidth);   │        │
│  │    }, []);                          │        │
│  └──────────────────────────────────────┘        │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Key Elements:**
- Code example showing before/after
- Syntax highlighting
- Error indicator (❌) and fix indicator (✅)
- Clean, developer-focused aesthetic

---

### Option 3: Stat-Driven

**Layout:**
```
┌────────────────────────────────────────────────────┐
│                                                    │
│              SSR Doctor                            │
│       Prevent Production SSR Crashes               │
│                                                    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │  100%   │  │   25+   │  │    3    │          │
│  │Detection│  │Browser  │  │ Rule    │          │
│  │  Rate   │  │  APIs   │  │Categories│          │
│  └─────────┘  └─────────┘  └─────────┘          │
│                                                    │
│  [GitHub Actions Badge] [Next.js Logo]            │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Key Elements:**
- Big numbers/stats
- Visual metrics
- Framework logos (Next.js, React, Remix)
- GitHub Actions integration badge

---

## 🎯 Recommended Design (Option 1 Enhanced)

### Visual Mockup Description

**Top Section (40%):**
```
Background: Linear gradient from #1F2937 to #111827
┌────────────────────────────────────────────────────┐
│  [🔍 Icon]                                         │
│  SSR Doctor                                        │
│  Catch SSR Issues Before Production ✨             │
└────────────────────────────────────────────────────┘
```

**Middle Section (60%):**
```
Background: White #FFFFFF or Light #F9FAFB
┌────────────────────────────────────────────────────┐
│                                                    │
│  ✅ Detect browser API misuse                      │
│  ✅ Prevent hydration mismatches                   │
│  ✅ Enforce dynamic import best practices          │
│                                                    │
│  ┌────────────────────────────────────────┐      │
│  │ ⚠️ Found 3 SSR issues in 2 files      │      │
│  │                                        │      │
│  │ src/components/Header.tsx:23           │      │
│  │ ❌ window is not available on server   │      │
│  └────────────────────────────────────────┘      │
│                                                    │
│  [GitHub Actions Logo]  "Zero Config Setup"       │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 🛠️ Creation Tools

### Option 1: Figma (Recommended)
1. Create 1280x640px frame
2. Use Figma's component system
3. Export as PNG @2x for sharpness
4. **Free Templates**: Search for "GitHub Action cover" on Figma Community

### Option 2: Canva
1. Create custom 1280x640px design
2. Use built-in templates for social media covers
3. Export as PNG

### Option 3: Adobe Illustrator / Photoshop
1. New document: 1280x640px, 72 DPI
2. Design with vector shapes
3. Export as PNG with high quality

### Option 4: Code-Based (HTML/CSS to Image)
```bash
# Using html-to-image or puppeteer
npm install html-to-image
```

Example HTML template:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    .container {
      width: 1280px;
      height: 640px;
      background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-family: 'Inter', sans-serif;
      color: white;
    }
    .title {
      font-size: 96px;
      font-weight: 700;
      margin-bottom: 20px;
    }
    .tagline {
      font-size: 36px;
      opacity: 0.9;
      margin-bottom: 60px;
    }
    .features {
      display: flex;
      gap: 40px;
      font-size: 24px;
    }
    .feature {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .checkmark {
      color: #22C55E;
      font-size: 32px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="title">🔍 SSR Doctor</div>
    <div class="tagline">Catch SSR Issues Before Production</div>
    <div class="features">
      <div class="feature">
        <span class="checkmark">✓</span>
        <span>Browser API Detection</span>
      </div>
      <div class="feature">
        <span class="checkmark">✓</span>
        <span>Hydration Prevention</span>
      </div>
      <div class="feature">
        <span class="checkmark">✓</span>
        <span>Dynamic Import Validation</span>
      </div>
    </div>
  </div>
</body>
</html>
```

---

## 📋 Design Checklist

### Content Requirements
- [ ] "SSR Doctor" title clearly visible
- [ ] Clear value proposition (tagline)
- [ ] At least 2-3 key features shown
- [ ] GitHub Actions branding/logo included
- [ ] Framework logos (Next.js, React) if space allows
- [ ] Visual element (code snippet, PR comment, or icon)

### Visual Requirements
- [ ] High contrast for readability
- [ ] Professional color scheme
- [ ] No pixelation or blurring
- [ ] Text is legible at thumbnail size (320x160)
- [ ] Proper spacing and margins
- [ ] Consistent with GitHub's design language

### Technical Requirements
- [ ] Exactly 1280x640 pixels
- [ ] PNG format (preferred) or JPG
- [ ] Under 2 MB file size
- [ ] Saved as `cover.png` in `/assets/` directory
- [ ] Looks good in both light and dark GitHub themes

---

## 🎨 Brand Assets

### Icon/Logo Suggestions

**Option 1: Stethoscope Icon**
- Represents "doctor" theme
- Can be modified to include code/tech elements
- Color: Blue (#0066FF) or Green (#22C55E)

**Option 2: Shield with Checkmark**
- Represents protection/validation
- Professional and trustworthy
- Color: Blue with green checkmark

**Option 3: Browser Window with Check**
- Directly relates to browser API detection
- Technical and specific
- Color: Blue frame with green check

### Where to Find Icons
- **Heroicons**: https://heroicons.com/ (check-circle, shield-check)
- **Lucide**: https://lucide.dev/ (stethoscope, check-circle)
- **Feather Icons**: https://feathericons.com/ (check-circle, shield)
- **Font Awesome**: https://fontawesome.com/ (user-md, shield-check)

---

## 📊 Examples from Popular Actions

### Inspiration from Successful Actions

1. **Super-Linter**
   - Clean, professional design
   - Features list prominently displayed
   - Framework logos included

2. **CodeQL**
   - Minimal, security-focused
   - Dark background with bright text
   - Code snippet showing detection

3. **Lighthouse CI**
   - Stat-driven design
   - Score/metric prominently displayed
   - Clear value proposition

---

## 🚀 Quick Start Guide

### For Non-Designers

If you don't have design experience:

1. **Use Canva Template**:
   - Go to canva.com
   - Search for "GitHub social media cover"
   - Customize with SSR Doctor branding
   - Export as PNG

2. **Use Figma Community Template**:
   - Search "GitHub Action cover template"
   - Duplicate and customize
   - Export as PNG @2x

3. **Hire a Designer** (Budget Option):
   - Fiverr: $10-30 for simple cover
   - Upwork: $50-100 for professional design
   - Provide this spec document as reference

---

## 📝 Copy Suggestions

### Main Taglines (Choose One)
1. "Catch SSR Issues Before Production"
2. "Prevent SSR Crashes in CI/CD"
3. "Automated SSR Compatibility Checks"
4. "Zero SSR Errors, Every Deploy"
5. "Ship SSR Apps with Confidence"

### Feature Text (Use 2-3)
- ✅ Detect browser API misuse
- ✅ Prevent hydration mismatches
- ✅ Validate dynamic imports
- ✅ 100% detection rate
- ✅ Zero false positives
- ✅ Auto-fix suggestions
- ✅ Zero configuration required

---

## 🎯 Final Placement

Once created, place the cover image at:
```
/assets/cover.png
```

Then reference it in the GitHub Marketplace listing when publishing the action.

---

## ✅ Validation

Before finalizing:

1. **View at Multiple Sizes**:
   - Full size (1280x640)
   - Card size (640x320)
   - Thumbnail (320x160)

2. **Check Both Themes**:
   - Light mode
   - Dark mode

3. **Get Feedback**:
   - Show to 2-3 developers
   - Ask: "What does this action do?"
   - Verify message is clear

4. **A/B Test If Possible**:
   - Create 2-3 variants
   - Get team vote
   - Choose most effective

---

## 📞 Resources

- **GitHub Actions Branding Guidelines**: https://github.com/actions/branding
- **GitHub Marketplace Requirements**: https://docs.github.com/en/actions/creating-actions/publishing-actions-in-github-marketplace
- **Color Palette Generator**: https://coolors.co/
- **Free Stock Images**: https://unsplash.com/ (if using photos)

---

<p align="center">
  <strong>Remember: The cover image is the first impression of your action. Make it count!</strong>
</p>
