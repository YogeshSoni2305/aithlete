import axios from "axios";
import * as cheerio from "cheerio";

async function testScraper(query: string) {
    console.log(`Testing scraper for query: "${query}"`);

    const ddgUrl = "https://html.duckduckgo.com/html/";
    const params = new URLSearchParams();
    params.append("q", `${query} workout tutorial site:youtube.com`);

    try {
        const { data } = await axios.post(ddgUrl, params, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });

        const $ = cheerio.load(data);
        const results: { title: string; rawLink: string | undefined }[] = [];

        console.log("HTML fetched, length:", data.length);

        const resultElements = $(".result");
        console.log("Found .result elements:", resultElements.length);

        if (resultElements.length === 0) {
            console.log("Dumping part of HTML to check structure:");
            console.log(data.substring(0, 1000));
            // Also check for common error messages
            if (data.includes("If you are a human")) console.log("Blocked by DDG bot check?");
        }

        resultElements.each((i, el) => {
            if (results.length >= 4) return;
            const title = $(el).find(".result__title .result__a").text().trim();
            const rawLink = $(el).find(".result__title .result__a").attr("href");

            if (title && rawLink) {
                results.push({ title, rawLink });
            }
        });

        console.log("Parsed Results:", results);

    } catch (error) {
        console.error("Scraper failed:", error);
    }
}

testScraper("Push ups");
