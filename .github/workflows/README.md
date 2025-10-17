# GitHub Actions Workflows

This repository uses GitHub Actions for continuous integration and deployment to GitHub Pages.

## Workflows

### 1. Build and Deploy (`build-and-deploy.yml`)

**Triggers:**
- Push to `experiment` branch
- Pull requests to `experiment` branch
- Manual workflow dispatch

**Jobs:**
1. **Lint and Test** - Runs ESLint and all unit tests
2. **Build** - Compiles the three.js library
3. **Deploy** - Deploys to GitHub Pages (only on push to experiment branch)

**Deployment:**
- Automatically deploys to GitHub Pages when code is pushed to the `experiment` branch
- Includes: build/, editor/, examples/, docs/, manual/, playground/
- URL: https://higginsrob.github.io/three.js/

### 2. Pull Request Checks (`pr-checks.yml`)

**Triggers:**
- Pull requests to `experiment` branch
- Ignores: Markdown files, LICENSE, .gitignore

**Jobs:**
- Runs linting
- Executes unit tests (core and addons)
- Builds the project
- Posts a comment on the PR with the build status

### 3. Manual Test & Build (`manual-test.yml`)

**Triggers:**
- Manual workflow dispatch only

**Options:**
- `run_e2e_tests`: Choose whether to run E2E tests (optional, takes longer)

**Jobs:**
- Full test suite (lint, unit tests, build)
- Tree-shaking validation
- Optional E2E testing with screenshot uploads
- Generates a build summary with file sizes

## Setting Up GitHub Pages

To enable GitHub Pages deployment:

1. Go to your repository **Settings** → **Pages**
2. Under "Build and deployment":
   - Source: **GitHub Actions**
3. Save the changes

The site will be automatically deployed when you push to the `experiment` branch.

## Local Testing

Before pushing, you can run these commands locally:

```bash
# Run linter
npm run lint

# Run unit tests
npm run test-unit
npm run test-unit-addons

# Build the project
npm run build

# Run all tests
npm test
```

## Workflow Permissions

The workflows require the following permissions:
- `contents: read` - Read repository contents
- `pages: write` - Deploy to GitHub Pages
- `id-token: write` - Required for GitHub Pages deployment
- `pull-requests: write` - Post comments on PRs (PR checks only)

## Concurrency

The deployment workflow uses concurrency control to ensure only one deployment runs at a time, preventing conflicts.

## Artifacts

- **Build files**: Retained for 7 days after workflow completion
- **E2E screenshots**: Uploaded when E2E tests run (manual workflow only)

## Environment

- **Node.js version**: 22
- **Package manager**: npm with cache enabled
- **Operating system**: Ubuntu latest (Linux)

## Customization

To modify the workflows:

1. Edit the YAML files in `.github/workflows/`
2. Test locally if possible
3. Commit and push to trigger the workflows
4. Check the "Actions" tab in your repository to monitor progress

## Troubleshooting

**Deployment not working?**
- Ensure GitHub Pages is enabled in repository settings
- Check that the `experiment` branch is set as the deployment source
- Verify workflow permissions in Settings → Actions → General

**Tests failing?**
- Run tests locally first: `npm test`
- Check the Actions tab for detailed error logs
- Ensure all dependencies are up to date: `npm ci`

**Build artifacts missing?**
- Verify the build completes successfully
- Check artifact retention settings (default: 7 days)
- Review the workflow logs for upload errors
