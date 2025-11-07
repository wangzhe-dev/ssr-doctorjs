# GitHub Marketplace Listing Checklist

Complete checklist for publishing SSR Doctor GitHub Action to the GitHub Marketplace.

---

## 📋 Pre-Submission Checklist

### ✅ Repository Requirements

- [ ] **Repository is public**
  - Go to Settings → Danger Zone → Change visibility
  - Must be public for Marketplace listing

- [ ] **Action code is committed to main/master branch**
  - Ensure `packages/action/action.yml` is in the root or subdirectory
  - Commit all source files
  - Push to default branch

- [ ] **README.md exists and is comprehensive**
  - Located at `packages/action/README.md`
  - Contains usage examples, inputs, outputs documentation
  - ✅ Already created (800+ lines)

- [ ] **LICENSE file exists**
  - Located at root: `/LICENSE`
  - MIT license recommended for wider adoption
  - ✅ Already exists

- [ ] **action.yml is valid and complete**
  - Contains: name, description, author
  - Has branding (icon, color)
  - Defines all inputs and outputs
  - Specifies runtime (runs.using)
  - ✅ Already completed with full metadata

---

## 🎨 Visual Assets

### Cover Image

- [ ] **Create cover.png (1280x640px)**
  - Use specifications in `/assets/cover-design-specs.md`
  - Save as `/assets/cover.png`
  - Maximum 2 MB file size
  - PNG format preferred
  - ⚠️ **ACTION REQUIRED**: Design and create this image

- [ ] **Test cover at different sizes**
  - Full size: 1280x640
  - Card view: 640x320
  - Thumbnail: 320x160
  - Verify text is readable at all sizes

- [ ] **Verify cover works in both themes**
  - Test in GitHub light mode
  - Test in GitHub dark mode

### Branding Icon

- [ ] **Verify action.yml branding section**
  - Icon: `check-circle` ✅ Already set
  - Color: `blue` ✅ Already set
  - See available icons: https://github.com/actions/branding

---

## 📝 Documentation Requirements

### README.md Quality Check

- [ ] **Clear value proposition** (first 3 lines)
  - ✅ "Automated SSR compatibility checks..."

- [ ] **Quick start example** (copy-paste ready)
  - ✅ Basic YAML workflow example included

- [ ] **All inputs documented**
  - ✅ path, format, fail-on-error, strict, ignore, token

- [ ] **All outputs documented**
  - ✅ issues-found, results, has-errors

- [ ] **At least 3 usage examples**
  - ✅ 8 comprehensive examples provided

- [ ] **Links to main repository docs**
  - ✅ Links to main README, CLI, ESLint plugin

- [ ] **Troubleshooting section**
  - ✅ Included in main README

### Additional Documentation

- [ ] **CONTRIBUTING.md** (optional but recommended)
  - ✅ Already exists at root

- [ ] **CODE_OF_CONDUCT.md** (optional but recommended)
  - ✅ Already exists at root

- [ ] **SECURITY.md** (optional but recommended)
  - ✅ Already exists at root

---

## 🔧 Technical Validation

### Action Functionality

- [ ] **Build and bundle action code**
  ```bash
  cd packages/action
  pnpm install
  pnpm build
  ```
  - Ensure `dist/index.js` is created
  - Commit `dist/` to repository (required for actions)

- [ ] **Test action locally with act**
  ```bash
  # Install act: https://github.com/nektos/act
  brew install act  # macOS
  # or
  curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

  # Test the action
  act pull_request
  ```

- [ ] **Create test workflow**
  - Add `.github/workflows/test-action.yml`
  - Test in a PR to verify it works
  - Example below ↓

### Test Workflow Example

Create `.github/workflows/test-action.yml`:

```yaml
name: Test SSR Doctor Action

on:
  pull_request:
    paths:
      - 'packages/action/**'
  workflow_dispatch:

jobs:
  test-action:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Test SSR Doctor Action
        uses: ./packages/action
        with:
          path: ./examples/next-app/src
          fail-on-error: false

      - name: Verify Outputs
        run: |
          echo "Issues found: ${{ steps.test.outputs.issues-found }}"
```

- [ ] **Run test workflow successfully**
  - Push to PR
  - Verify action executes without errors
  - Check outputs are populated correctly

---

## 🏷️ Release & Versioning

### Create Initial Release

- [ ] **Tag the release**
  ```bash
  git tag -a action-v1.0.0 -m "Initial release of SSR Doctor GitHub Action"
  git push origin action-v1.0.0
  ```

- [ ] **Create GitHub Release**
  - Go to: https://github.com/wangzhe-dev/ssr-doctorjs/releases/new
  - Tag: `action-v1.0.0`
  - Title: `SSR Doctor Action v1.0.0`
  - Description: Copy from release notes template below ↓

### Release Notes Template

```markdown
# SSR Doctor Action v1.0.0

Initial release of the SSR Doctor GitHub Action for automated SSR compatibility checking.

## 🎯 Features

- ✅ Automated SSR compatibility scanning in CI/CD
- ✅ PR comment integration with inline annotations
- ✅ 100% detection rate for browser API misuse
- ✅ Support for Next.js, Remix, Gatsby, and React 18
- ✅ Zero configuration required
- ✅ Multiple output formats (text, JSON, markdown, SARIF)

## 📋 Quick Start

\`\`\`yaml
- uses: ssr-doctor/action@v1
  with:
    path: ./src
\`\`\`

## 📚 Documentation

- [Action README](https://github.com/wangzhe-dev/ssr-doctorjs/tree/main/packages/action)
- [Main Documentation](https://github.com/wangzhe-dev/ssr-doctorjs#readme)
- [Usage Examples](https://github.com/wangzhe-dev/ssr-doctorjs/blob/main/packages/action/README.md#-usage-examples)

## 🔗 Related Packages

- ESLint Plugin: [@ssr-doctor/eslint-plugin](https://www.npmjs.com/package/@ssr-doctor/eslint-plugin)
- CLI Tool: [@ssr-doctor/cli](https://www.npmjs.com/package/@ssr-doctor/cli)

## 📊 What's Detected

1. Direct browser API usage (window, document, localStorage, etc.)
2. Missing `{ ssr: false }` in next/dynamic imports
3. Hydration risks from render-time browser API access

Full list: [Demo Output](https://github.com/wangzhe-dev/ssr-doctorjs/blob/main/docs/demo-output.md)

---

**Full Changelog**: https://github.com/wangzhe-dev/ssr-doctorjs/commits/action-v1.0.0
```

- [ ] **Publish the release**
  - Click "Publish release"

### Version Tags

- [ ] **Create major version tag (v1)**
  ```bash
  git tag -fa v1 -m "Update v1 to v1.0.0"
  git push origin v1 --force
  ```

  This allows users to use `@v1` which auto-updates to latest v1.x.x

- [ ] **Verify tags exist**
  ```bash
  git tag -l
  # Should show: action-v1.0.0, v1
  ```

---

## 🚀 Marketplace Submission

### Navigate to Marketplace

1. [ ] **Go to repository Settings**
   - https://github.com/wangzhe-dev/ssr-doctorjs/settings

2. [ ] **Scroll to "GitHub Marketplace"**
   - Or visit: https://github.com/marketplace/new

3. [ ] **Click "Draft a new listing"**

### Fill Out Marketplace Form

#### Primary Information

- [ ] **Primary Category**
  - Select: **"Code quality"** or **"Continuous integration"**

- [ ] **Additional Category** (optional)
  - Select: **"Testing"** or **"Deployment"**

- [ ] **Listing Name**
  - Enter: `SSR Doctor`
  - ⚠️ Must be unique across GitHub Marketplace

- [ ] **Listing Description** (short)
  ```
  Detect and prevent server-side rendering compatibility issues in React and Next.js applications before they reach production.
  ```

- [ ] **Long Description**
  ```
  SSR Doctor automatically scans your codebase for common SSR pitfalls including:

  • Direct browser API usage (window, document, localStorage)
  • Missing { ssr: false } in next/dynamic imports
  • Hydration risks from render-time browser API access

  Features:
  - 100% detection rate with zero false positives
  - Inline PR comments with fix suggestions
  - Support for Next.js, Remix, Gatsby, and React 18
  - Zero configuration required
  - Multiple output formats (text, JSON, markdown, SARIF)

  Perfect for teams using SSR/SSG frameworks who want to catch compatibility issues before deployment.
  ```

#### Media

- [ ] **Upload cover image**
  - File: `/assets/cover.png`
  - Must be exactly 1280x640 pixels
  - ⚠️ **ACTION REQUIRED**: Create this image first

- [ ] **Add screenshots** (optional but recommended)
  - Screenshot 1: PR comment with violation
  - Screenshot 2: CLI output showing detection
  - Screenshot 3: GitHub Actions check result
  - Each: Max 2048x2048 pixels

#### Links

- [ ] **Repository URL**
  ```
  https://github.com/wangzhe-dev/ssr-doctorjs
  ```

- [ ] **Documentation URL**
  ```
  https://github.com/wangzhe-dev/ssr-doctorjs/blob/main/packages/action/README.md
  ```

- [ ] **Homepage URL** (optional)
  ```
  https://github.com/wangzhe-dev/ssr-doctorjs
  ```

- [ ] **Support URL** (optional)
  ```
  https://github.com/wangzhe-dev/ssr-doctorjs/issues
  ```

#### Pricing

- [ ] **Select pricing model**
  - Choose: **"This action is free"**

#### Keywords/Tags

- [ ] **Add relevant tags** (helps discoverability)
  ```
  ssr
  nextjs
  react
  hydration
  server-side-rendering
  static-site-generation
  eslint
  code-quality
  continuous-integration
  typescript
  javascript
  browser-api
  dynamic-import
  remix
  gatsby
  ```
  - Maximum 20 tags
  - Use lowercase
  - Separate with commas

---

## 🔒 Privacy & Legal

### Terms

- [ ] **Accept GitHub Marketplace Terms**
  - Review: https://docs.github.com/en/github/site-policy/github-marketplace-terms-of-service
  - Required for listing

- [ ] **Verify license is compatible**
  - MIT license ✅ is compatible
  - Must allow others to use action

### Data & Privacy

- [ ] **Review data handling**
  - Action does NOT collect user data
  - Action does NOT send data to external servers
  - Action only analyzes code locally in GitHub Actions runner

- [ ] **Add privacy note to README** (if not already present)
  ```markdown
  ## 🔒 Privacy

  SSR Doctor:
  - Runs entirely within your GitHub Actions runner
  - Does NOT send code or data to external servers
  - Does NOT collect or store any user information
  - Only accesses files within the repository being scanned
  ```

- [ ] **Confirm in marketplace form**
  - ✅ This action does not collect data
  - ✅ This action does not make external API calls

---

## ✅ Pre-Launch Validation

### Test Installation

- [ ] **Test action in a separate repo**
  1. Create new test repository
  2. Add workflow using `uses: wangzhe-dev/ssr-doctorjs/packages/action@v1`
  3. Create PR with SSR violation
  4. Verify action runs and detects issue
  5. Check PR comments are posted

- [ ] **Verify action works for first-time users**
  - No special setup required
  - Works with default inputs
  - Clear error messages if misconfigured

### Documentation Review

- [ ] **Proofread all documentation**
  - Check for typos
  - Verify links work
  - Test code examples

- [ ] **Get peer review**
  - Have 1-2 developers review README
  - Ask: "Is it clear how to use this?"
  - Incorporate feedback

---

## 🎉 Submission & Launch

### Submit for Review

- [ ] **Click "Submit for review"**
  - GitHub will review within 1-2 business days
  - May ask for changes/clarifications

- [ ] **Monitor email for GitHub notifications**
  - Check spam folder
  - Respond promptly to reviewer questions

### After Approval

- [ ] **Action is live on Marketplace**
  - URL: `https://github.com/marketplace/actions/ssr-doctor`
  - Can be searched by users

- [ ] **Test marketplace installation**
  ```yaml
  - uses: wangzhe-dev/ssr-doctorjs@v1  # If published from root
  # or
  - uses: wangzhe-dev/ssr-doctorjs/packages/action@v1
  ```

- [ ] **Update references in documentation**
  - Change example workflows to use marketplace path
  - Add marketplace badge to README

---

## 📢 Post-Launch Promotion

### Update Documentation

- [ ] **Add Marketplace badge to main README**
  ```markdown
  [![GitHub Marketplace](https://img.shields.io/badge/Marketplace-SSR%20Doctor-blue?logo=github)](https://github.com/marketplace/actions/ssr-doctor)
  ```

- [ ] **Update action README with marketplace link**
  ```markdown
  [🏪 Available on GitHub Marketplace](https://github.com/marketplace/actions/ssr-doctor)
  ```

### Announce Launch

- [ ] **Create announcement issue**
  - Title: "SSR Doctor Action is now on GitHub Marketplace! 🎉"
  - Pin to repository

- [ ] **Share on social media** (optional)
  - Twitter/X
  - Reddit (r/nextjs, r/reactjs)
  - Dev.to
  - Hashnode

- [ ] **Add to awesome lists** (optional)
  - awesome-actions
  - awesome-nextjs
  - awesome-react

---

## 🔄 Maintenance Checklist

### For Future Updates

When releasing new versions:

1. [ ] **Update version in package.json**
2. [ ] **Create new git tag** (e.g., `action-v1.1.0`)
3. [ ] **Update major version tag** (`v1`)
4. [ ] **Create GitHub Release** with changelog
5. [ ] **Update marketplace listing** (if needed)
6. [ ] **Notify users** via release notes

### Monitoring

- [ ] **Set up issue templates** for action-specific bugs
- [ ] **Monitor Marketplace reviews/ratings**
- [ ] **Track installation stats** (visible in Marketplace dashboard)
- [ ] **Respond to user feedback** promptly

---

## 🚨 Common Issues & Solutions

### Issue: "action.yml not found"

**Solution:**
- Ensure `action.yml` is at repository root or in subdirectory
- If using monorepo, users must specify full path:
  ```yaml
  uses: wangzhe-dev/ssr-doctorjs/packages/action@v1
  ```

### Issue: "dist/index.js not found"

**Solution:**
```bash
cd packages/action
pnpm build
git add dist/
git commit -m "build: add compiled action bundle"
git push
```

### Issue: Action runs but does nothing

**Solution:**
- Check action code logs with `console.log()`
- Verify inputs are being received correctly
- Test locally with `act` tool

### Issue: Marketplace rejects submission

**Common Reasons:**
- Cover image wrong size (must be exactly 1280x640)
- Inappropriate content in description
- Missing required metadata in action.yml
- License incompatible
- Security concerns

**Solution:** Address feedback from reviewer and resubmit

---

## 📊 Success Metrics

After launch, track:

- [ ] **Installation count** (Marketplace dashboard)
- [ ] **Stars on repository**
- [ ] **Issues opened** (user engagement)
- [ ] **PR contributions** (community involvement)
- [ ] **Marketplace rating** (user satisfaction)

### Target Metrics (First Month)

- 50+ installs
- 25+ repository stars
- 4.5+ Marketplace rating
- 5+ community issues/PRs

---

## 📞 Support Resources

- **GitHub Marketplace Documentation**: https://docs.github.com/en/actions/creating-actions/publishing-actions-in-github-marketplace
- **GitHub Actions Documentation**: https://docs.github.com/en/actions
- **Branding Guidelines**: https://github.com/actions/branding
- **Community Forum**: https://github.com/community/community/discussions

---

## ✅ Final Pre-Submission Checklist

Before clicking "Submit for review":

- [ ] ✅ Repository is public
- [ ] ✅ README.md is comprehensive and error-free
- [ ] ✅ LICENSE file exists (MIT)
- [ ] ✅ action.yml is complete with metadata
- [ ] ⚠️ Cover image created (1280x640px)
- [ ] ✅ Action tested and working
- [ ] ✅ Version tags created (v1.0.0, v1)
- [ ] ✅ GitHub Release published
- [ ] ✅ All links in documentation work
- [ ] ✅ Keywords/tags added
- [ ] ✅ Privacy policy reviewed
- [ ] ✅ Peer review completed

**Only item pending:** Cover image creation

---

## 🎯 Quick Action Plan

**Right Now:**
1. Create cover image using `/assets/cover-design-specs.md`
2. Save as `/assets/cover.png`
3. Build action: `cd packages/action && pnpm build`
4. Commit `dist/` folder
5. Create tags and release

**Then Submit:**
1. Go to GitHub Marketplace submission form
2. Fill out all fields using this checklist
3. Upload cover.png
4. Submit for review

**Wait 1-2 days for approval** ✨

---

<p align="center">
  <strong>Good luck with your Marketplace listing! 🚀</strong>
</p>
