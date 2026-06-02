import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function getMeditationQuote(language: 'zh' | 'en' = 'zh') {
  const isZh = language === 'zh';
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const prompt = isZh
      ? `你是一个充满智慧的禅宗大师。请为正在拥挤通勤途中寻求内心平静的人写一个简短的、治愈的、具有新中式禅意特点的冥思语录。
    要求：
    1. 语言简练，富有诗意。
    2. 主题围绕“静”、“简”、“空”或“与喧嚣共处”。
    3. 只有一句话，不超过20个字。
    4. 不要带任何前缀或括号。`
      : `You are a wise Zen master. Please write a short, healing, Zen-inspired mindfulness quote for someone seeking inner peace in a crowded transit commute.
    Requirements:
    1. Rich in poetic and calming energy.
    2. Theme should center around "stillness", "simplicity", "emptiness", or "coexisting with clutter".
    3. Exactly one short sentence, maximum 15 words.
    4. Provide the quote purely with no introductory, greeting text, preambles, or brackets.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error fetching zen quote:", error);
    return isZh ? "心若不动，风又奈何。" : "If the mind remains unmoved, what can the wind do.";
  }
}
