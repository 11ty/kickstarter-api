# kickstarter-api

Scheduled GitHub Actions scraper that publishes Kickstarter campaign stats as a static JSON endpoint via GitHub Pages.

## How it works

1. A GitHub Actions cron job runs every hour on the `gh-pages` branch
2. Puppeteer scrapes `?format=json` from the Kickstarter campaign page
3. Stats are written to `build-awesome-pro.json` and committed back to `gh-pages`
4. GitHub Pages serves the file at:
   ```
   https://11ty.github.io/kickstarter-api/build-awesome-pro.json
   ```

## Setup

### 1. Create the repo and enable GitHub Pages

- Create a new GitHub repo named `kickstarter-api`
- Go to **Settings → Pages**
- Set source to **Deploy from a branch**, branch `gh-pages`, folder `/ (root)`

### 2. Create the gh-pages branch with an initial commit

```bash
git checkout --orphan gh-pages
echo '{}' > build-awesome-pro.json
git add output/build-awesome-pro.json
git commit -m "chore: init gh-pages"
git push origin gh-pages
```

### 3. Install dependencies on gh-pages

The workflow runs `npm ci` on the `gh-pages` branch, so `package.json` and
`package-lock.json` need to be there too:

```bash
# Still on gh-pages
npm install
git add package.json package-lock.json
git commit -m "chore: add dependencies"
git push origin gh-pages
```

### 4. Copy the workflow and script

The `.github/workflows/scrape.yml` and `scripts/scrape.js` files must also
exist on the `gh-pages` branch (Actions reads workflows from the triggered ref):

```bash
git add .github scripts
git commit -m "chore: add scraper"
git push origin gh-pages
```

### 5. Trigger a first run

Go to **Actions → Scrape Kickstarter → Run workflow** to verify it works before
waiting for the hourly cron.

## Consuming the endpoint in Eleventy

```js
// _data/campaign.js
import EleventyFetch from "@11ty/eleventy-fetch";

export default async function () {
  return EleventyFetch(
    "https://<your-org>.github.io/kickstarter-api/build-awesome-pro.json",
    { duration: "1h", type: "json" }
  );
}
```

## Response shape

```json
{
  "backers": 616,
  "pledged": 75921.0,
  "currency": "USD",
  "goal": 30000,
  "percentFunded": 253,
  "updatedAt": "2026-05-14T12:00:00.000Z"
}
```
