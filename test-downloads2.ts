import { getSdk } from './src/lib/sdk';
async function test() {
  const sdk = await getSdk();
  console.log("Testing SDK getAll structure...");
  // We'll mock the rest call to see its format or directly fetch from the real local API if available.
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${API_URL}/api/downloads?articleId=351&limit=1`, {
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();
    console.log("REST API Response format:", Array.isArray(data) ? "Array" : Object.keys(data));
    console.log(JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error("Fetch error:", err.message);
  }
}
test().catch(console.error);
