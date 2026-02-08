
const repairMalformedHtml = (html: string): string => {
    if (!html) return html;
    let repaired = html;

    console.log("Original:", repaired);

    // 1. Decode generic HTML entities
    repaired = repaired
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

    console.log("Decoded:", repaired);

    // 2. Fix Pattern B (Broken middle quote)
    const messyLinkRegex = /<a\s+[^>]*href=["']<a\s+href=["']([^"']+)["'][^>]*>(.*?)["'][^>]*>(.*?)<\/a>/gi;

    repaired = repaired.replace(messyLinkRegex, (match, url, innerTitle, outerContent) => {
        console.log("Matched Messy:", { url, innerTitle, outerContent });
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${innerTitle || outerContent || url}</a>`;
    });

    // 3. Fix Pattern A (Clean nested)
    const nestedLinkRegex = /<a\s+[^>]*href=["']\s*<a\s+href=['"]([^'"]+)['"][^>]*>.*?<\/a>\s*["'][^>]*>(.*?)<\/a>/gi;
    repaired = repaired.replace(nestedLinkRegex, (match, url, text) => {
        console.log("Matched Nested:", { url, text });
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    });

    return repaired;
};

const input1 = `&lt;a href=&quot;<a href="https://pinktwilight.itch.io/bunkered-with-femboy">Bunkered&quot; class=&quot;redactor-linkify-object&quot;&gt;https://pinktwilight.itch.io/bunkered-with-femboy&quot;&gt;Bunkered</a> With Femboy by PinkTwilight&lt;/a&gt;`;
const input2 = `&lt;a href=&quot;<a href="https://invisiblecactus.itch.io/my-fluffy-neighbor">My Fluffy Neighbor by InvisibleCactus</a>`;
// Note input2 from user sample seemed to be just normal escaped HTML that was rendered as text
// If it is just &lt;a ... &gt; ... &lt;/a&gt;, the decode step handles it.

console.log("\n--- Test Case 1 (Messy) ---");
console.log("Result:", repairMalformedHtml(input1));

console.log("\n--- Test Case 2 (Simple) ---");
console.log("Result:", repairMalformedHtml(input2));
