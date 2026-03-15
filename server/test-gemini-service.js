/**
 * Test geminiService directly (bypasses route/orchestrator)
 * Run: node server/test-gemini-service.js
 */
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

console.log('GEMINI_API_KEY loaded:', process.env.GEMINI_API_KEY ? 'YES' : 'NO');

const geminiService = require('./services/geminiService');

console.log('Testing geminiService.generateContent()...');

geminiService.generateContent({
    prompt: 'Write a 2-sentence story about a brave knight.',
    config: { maxTokensPerResponse: 100, temperature: 0.7 },
    stream: false,
}).then(result => {
    console.log('✅ SUCCESS!');
    console.log('Generated text:', result.substring(0, 300));
    process.exit(0);
}).catch(err => {
    console.log('❌ FAILED:', err.message);
    process.exit(1);
});
