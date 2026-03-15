/**
 * Quick diagnostic test — run from project root:
 *   node server/test-gemini-debug.js
 */
const path = require('path');
const dotenv = require('dotenv');

// Load env files exactly like backend.js does
const envPath1 = path.resolve(__dirname, '.env');
const envPath2 = path.resolve(__dirname, '..', '.env.local');

console.log('=== DOTENV DIAGNOSTIC ===');
console.log('Loading:', envPath1);
const r1 = dotenv.config({ path: envPath1 });
if (r1.error) console.log('  ERROR:', r1.error.message);
else console.log('  OK, parsed', Object.keys(r1.parsed || {}).length, 'vars');

console.log('Loading:', envPath2);
const r2 = dotenv.config({ path: envPath2 });
if (r2.error) console.log('  ERROR:', r2.error.message);
else console.log('  OK, parsed', Object.keys(r2.parsed || {}).length, 'vars');

console.log('\n=== ENV VARS ===');
const geminiKey = process.env.GEMINI_API_KEY;
const googleKey = process.env.GOOGLE_API_KEY;
const model = process.env.GEMINI_MODEL;
console.log('GEMINI_API_KEY:', geminiKey ? geminiKey.substring(0, 15) + '...' : 'NOT SET');
console.log('GOOGLE_API_KEY:', googleKey && googleKey !== 'your_google_api_key_here' ? googleKey.substring(0, 15) + '...' : 'NOT SET or placeholder');
console.log('GEMINI_MODEL:', model || 'NOT SET');

const apiKey = geminiKey || googleKey;
if (!apiKey || apiKey === 'your_google_api_key_here') {
    console.log('\n❌ NO VALID API KEY FOUND. Cannot test Gemini.');
    process.exit(1);
}

// Test direct Gemini API call
const effectiveModel = model || 'gemini-3-flash-preview';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${effectiveModel}:generateContent?key=${apiKey}`;

console.log('\n=== TESTING GEMINI API ===');
console.log('URL:', url.replace(apiKey, apiKey.substring(0, 10) + '***'));
console.log('Model:', effectiveModel);

fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        contents: [{ parts: [{ text: 'Say hello in one word' }] }],
        generationConfig: { maxOutputTokens: 10 },
    }),
    signal: AbortSignal.timeout(15000),
})
.then(async (res) => {
    const body = await res.text();
    console.log('HTTP Status:', res.status);
    if (res.ok) {
        console.log('✅ SUCCESS! Response:', body.substring(0, 200));
    } else {
        console.log('❌ FAILED! Error:', body.substring(0, 500));
    }
    process.exit(0);
})
.catch((err) => {
    console.log('❌ NETWORK ERROR:', err.message);
    process.exit(1);
});
