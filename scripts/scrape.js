import puppeteer from "puppeteer";
import { writeFileSync, readFileSync } from "fs";

const CAMPAIGN_URL = "https://www.kickstarter.com/projects/fontawesome/build-awesome-pro";
const TARGET_PATH = "docs/build-awesome-pro.json";

async function scrape() {
  const url = new URL(CAMPAIGN_URL);
  url.searchParams.set("format", "json");
  const jsonUrl = url.toString();

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

    const response = await page.goto(jsonUrl, { waitUntil: "networkidle2" });

    if (!response.ok()) {
      throw new Error(`Kickstarter returned HTTP ${response.status()}`);
    }

    const raw = await page.evaluate(() => document.body.innerText);
    const data = JSON.parse(raw);

    if (!data?.card) {
      throw new Error(`Response missing card key`);
    }

    const backers = parseInt(
      data.card.match(/data-project_backers_count="(\d+)"/)?.[1] ?? 0,
      10
    );
    const pledged = parseFloat(
      data.card.match(/data-project_pledged="([\d.]+)"/)?.[1] ?? 0
    );
    const percentFunded = parseFloat(
      data.card.match(/data-project_percent_raised="([\d.]+)"/)?.[1] ?? 0
    );
    const goal =
      percentFunded > 0 ? Math.round((pledged / percentFunded) * 100) : 0;

    const stats = {
      backers,
      pledged,
      currency: "USD",
      goal,
      percentFunded: Math.round(percentFunded),
    };

    let previous = JSON.parse(readFileSync(TARGET_PATH, "utf8"));
    let changed = false;
    for(let key in stats) {
      if(stats[key] !== previous[key]) {
        changed = true;
      }
    }

    if(!changed) {
      console.log("No changes detected, skipping write.");
      return;
    }
    
    if(backers == 0 || pledged == 0 || goal == 0) {
      console.log("Upstream fetch failed.");
      return;
    }

    stats.updatedAt = new Date().toISOString();

    writeFileSync(TARGET_PATH, JSON.stringify(stats, null, 2));
    console.log("Scraped:", stats);
  } finally {
    await browser.close();
  }
}

scrape().catch((err) => {
  console.error("Scrape failed:", err.message);
  process.exit(1);
});
