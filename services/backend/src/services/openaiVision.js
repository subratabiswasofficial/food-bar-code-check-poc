const fs = require("fs");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeImage(imagePath) {
  const imageBase64 = fs.readFileSync(imagePath, "base64");

  const prompt = `
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
`;

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: prompt },
          {
            type: "input_image",
            image_base64: imageBase64,
          },
        ],
      },
    ],
  });

  const text = response.output[0].content[0].text;

  return JSON.parse(text);
}

module.exports = analyzeImage;
