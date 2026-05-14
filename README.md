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

### Create the repo and enable GitHub Pages

- Create a new GitHub repo named `kickstarter-api`
- Go to **Settings → Pages**
- Set source to **Deploy from a branch**, branch `gh-pages`, folder `/docs`

### Consuming the endpoint in Eleventy

```js
// _data/campaign.js
import Fetch from "@11ty/eleventy-fetch";

export default async function () {
  return Fetch(
    "https://11ty.github.io/kickstarter-api/build-awesome-pro.json",
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
