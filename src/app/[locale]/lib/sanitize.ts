import DOMPurify from "dompurify";

export function sanitizeBodyContent(body: string): string {
  // ใช้ DOMPurify ใน browser environment เท่านั้น
  if (typeof window === "undefined") {
    // ฝั่ง server: ส่งคืน body โดยไม่ sanitize (สมมติว่า API return sanitized HTML)
    return body;
  }
  return DOMPurify.sanitize(body, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "ul", "li"],
    ALLOWED_ATTR: [],
  });
}