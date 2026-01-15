import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// Using the alias that maps to the high-quota model
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

const SYSTEM_PROMPT = `
You are an expert Frontend Developer.
I will send you a screenshot of a website.
Your goal is to recreate it EXACTLY using HTML and Tailwind CSS.

STRICT RULES:
1. Return ONLY the raw HTML code. Do not wrap it in markdown backticks.
2. Use Tailwind CSS via this CDN: <script src="https://cdn.tailwindcss.com"></script>
3. Use semantic HTML5 tags.
4. For images, use: "https://placehold.co/600x400/png"
5. For icons, use FontAwesome: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
6. Make it responsive.
`;