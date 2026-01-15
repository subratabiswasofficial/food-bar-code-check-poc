const fs = require("fs");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeImage(imagePath) {
  try {
    const buffer = fs.readFileSync(imagePath);
    const base64 = buffer.toString("base64");
    const imageDataUrl = `data:image/png;base64,${base64}`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
You are a food label analysis expert.

Extract food information from the image.

Return ONLY valid JSON in this format:
{
  "ingredients": [],
  "nutrients": {
    "energy": "",
    "protein": "",
    "carbohydrates": "",
    "sugars": "",
    "fat": "",
    "saturated_fat": "",
    "fiber": "",
    "sodium": ""
  },
  "allergens": [],
  "is_vegetarian": true,
  "is_vegan": false
}
`
            },
            {
              type: "input_image",
              image_url: imageDataUrl  
            }
          ]
        }
      ]
    });

let text = response.output_text;

text = text
  .replace(/```json/gi, "")
  .replace(/```/g, "")
  .trim();

if (!text || !text.startsWith("{")) {
  throw new Error("Invalid JSON received from OpenAI");
}

return JSON.parse(text);



  } catch (err) {
    console.error("❌ OpenAI Vision Error:", err);
    throw err;
  }
}

module.exports = analyzeImage;
