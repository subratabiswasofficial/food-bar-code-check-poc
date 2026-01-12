const fs = require("fs");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeImage(imagePath) {
  const imageBase64 = fs.readFileSync(imagePath, "base64");

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: "Describe this image" },
          {
            type: "input_image",
            image_base64: imageBase64,
          },
        ],
      },
    ],
  });

  return response.output_text;
}

module.exports = analyzeImage;
