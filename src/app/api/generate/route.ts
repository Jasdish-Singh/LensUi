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
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image, currentCode, instruction } = body;

    if (!image) {
      return new Response(JSON.stringify({ error: "No image provided" }), { status: 400 });
    }

    const base64Data = image.split(",")[1];
    const mimeType = image.split(";")[0].split(":")[1];

    let finalPrompt = SYSTEM_PROMPT;

    if (instruction && currentCode) {
      finalPrompt = `
        You are an expert Frontend Developer.
        CONTEXT: The user has an existing HTML file and wants to make a change.
        CURRENT HTML: ${currentCode}
        USER INSTRUCTION: "${instruction}"
        TASK: Apply the instruction. Return the FULL HTML. Ensure Tailwind/FontAwesome links remain. Return ONLY raw HTML.
      `;
    }
    const result = await model.generateContent([
      finalPrompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanCode = text.replace(/```html/g, "").replace(/```/g, "").replace(/^Here is the.*/i, "");

    return new Response(JSON.stringify({ code: cleanCode }), { status: 200 });

  } catch (error) {
    console.error("Error generating code:", error);
    return new Response(JSON.stringify({ error: "Failed to generate code" }), { status: 500 });
  }
}