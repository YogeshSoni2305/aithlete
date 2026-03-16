import { safeApiResponse } from "@/lib/safety";
import axios from "axios";
import * as cheerio from "cheerio";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const type = searchParams.get("type"); // 'video' | 'recipe' | 'article'

    if (!query) {
        return safeApiResponse({ error: "Query is required" }, 400);
    }

    const results: any[] = [];
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    };

    try {
        const ddgUrl = "https://html.duckduckgo.com/html/";
        const params = new URLSearchParams();

        if (type === "video") {
            params.append("q", `${query} workout tutorial site:youtube.com`);
        } else {
            params.append("q", `${query} healthy recipe`);
        }

        const { data } = await axios.post(ddgUrl, params, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });

        const $ = cheerio.load(data);

        $(".result").each((i, el) => {
            if (results.length >= 4) return;

            const title = $(el).find(".result__title .result__a").text().trim();
            const rawLink = $(el).find(".result__title .result__a").attr("href");

            if (title && rawLink) {
                let url = rawLink;
                // Attempt to extract actual URL from DDG redirect if present
                if (rawLink.includes("uddg=")) {
                    const match = rawLink.match(/uddg=([^&]+)/);
                    if (match && match[1]) {
                        url = decodeURIComponent(match[1]);
                    }
                }

                let thumbnail = null;
                let source = "Web";

                if (url.includes("youtube.com") || url.includes("youtu.be")) {
                    source = "YouTube";
                    // Extract Video ID for thumbnail
                    const videoIdMatch = url.match(/(?:v=|youtu\.be\/)([^&?]+)/);
                    if (videoIdMatch && videoIdMatch[1]) {
                        thumbnail = `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg`;
                    }
                } else {
                    try {
                        source = new URL(url).hostname.replace("www.", "");
                    } catch (e) { }
                }

                results.push({
                    title,
                    url,
                    source,
                    thumbnail
                });
            }
        });
    } catch (error) {
        console.error("Content fetch error (using fallback):", error);
        // Continue to fallback
    }

    // Fallback if no results found (e.g., scraping blocked or failed)
    if (results.length === 0) {
        if (type === "video") {
            results.push({
                title: `Watch ${query} tutorials on YouTube`,
                url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query + " workout")}`,
                source: "YouTube Search",
                thumbnail: null
            });
        } else {
            results.push({
                title: `Find ${query} recipes on Google`,
                url: `https://www.google.com/search?q=${encodeURIComponent(query + " healthy recipe")}`,
                source: "Google Search",
                thumbnail: null
            });
        }
    }

    return safeApiResponse({ results });
}
