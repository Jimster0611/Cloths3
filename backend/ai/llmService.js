export async function getLLMReply(userMessage) {
  const apiKey = process.env.GEMINI_API_KEY;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a fashion stylists. A user said: "${userMessage}".
                  Reply in 2 sentences to a paragraph, AND on a new line output:
                  SEARCH_QUERY: <a short google-image-search query for clothing that matches what they want>`,
              },
            ],
          },
        ],
            generationConfig: {
            thinkingConfig: {
            thinkingBudget: 0,
            },
          },
      }),
    }
  );

  const data = await response.json();
  console.log("Gemini raw response:", JSON.stringify(data, null, 2)); 
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  const [replyPart, queryLine] = text.split("SEARCH_QUERY:");
  const reply = (replyPart || text).trim();
  const searchQuery = (queryLine || "clothing outfit").trim();

  return { reply, searchQuery };
}
