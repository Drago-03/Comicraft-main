/**
 * Quick test for Gemini image generation via generateImage()
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') });

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
console.log('API Key loaded:', apiKey ? `YES (${apiKey.substring(0, 10)}...)` : 'NO');

async function testImageGeneration() {
    const { generateImage } = require('./services/geminiService');
    
    console.log('\nTesting Gemini Image Generation (Nano Banana model)...');
    console.log('Model: gemini-2.5-flash-image');
    console.log('─'.repeat(50));
    
    try {
        const imageBuffer = await generateImage({
            prompt: 'A manga style comic panel showing a brave knight facing a dragon in an epic battle scene. Dramatic lighting, action lines, speech bubbles.',
            modelId: 'gemini-2.5-flash-image',
        });
        
        console.log(`\n✅ SUCCESS! Image generated.`);
        console.log(`   Buffer size: ${imageBuffer.length} bytes (${(imageBuffer.length / 1024).toFixed(1)} KB)`);
        
        // Save to disk for visual verification
        const fs = require('fs');
        const outPath = path.resolve(__dirname, 'test-panel-output.png');
        fs.writeFileSync(outPath, imageBuffer);
        console.log(`   Saved to: ${outPath}`);
    } catch (error) {
        console.error(`\n❌ FAILED: ${error.message}`);
        if (error.message.includes('404')) {
            console.error('   → Model "gemini-2.5-flash-image" may not be available. Try "gemini-2.0-flash-exp".');
        }
    }
}

testImageGeneration();
