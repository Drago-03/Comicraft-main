const dotenv = require('dotenv');
dotenv.config();

async function testImageGen() {
  try {
    const fetch = require('node-fetch') || global.fetch; // just in case
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log('No GEMINI_API_KEY found in .env');
      return;
    }

    const modelOptions = ['gemini-2.5-flash', 'gemini-2.5-flash-image'];

    for (const model of modelOptions) {
      console.log(`\nTesting model: ${model}`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'A futuristic comic city panel' }] }],
            generationConfig: {
              responseModalities: ['IMAGE'],
            },
          }),
        }
      );

      console.log(`Status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Success!', Object.keys(data));
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          console.log('Parts length:', data.candidates[0].content.parts.length);
          const part = data.candidates[0].content.parts[0];
          console.log('Part keys:', Object.keys(part));
          if (part.inlineData) {
            console.log('Has inlineData (mimeType):', part.inlineData.mimeType, 'data length:', part.inlineData.data?.length);
          }
        }
        break; // found the right one!
      } else {
        const error = await response.text();
        console.log(`Error: ${error}`);
      }
    }
  } catch (e) {
    console.error(e);
  }
}

testImageGen();
