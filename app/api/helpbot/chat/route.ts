import { NextResponse } from 'next/server';

/**
 * POST /api/helpbot/chat
 *
 * MADHAVA Help Bot — powered by Google Gemini.
 * Uses built-in Comicraft platform knowledge to answer user questions.
 * No external backend dependency.
 */
export const dynamic = 'force-dynamic';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const SYSTEM_PROMPT = `You are MADHAVA, the friendly AI help bot for Comicraft — a Creativity Tokenization Platform (CTP).

## Platform Overview
Comicraft is an AI-powered Web3 storytelling platform where writers and artists can:
- Generate immersive stories using AI (Google Gemini + Groq)
- Create comics with the Panelra Engine
- Mint stories as NFTs on Ethereum Mainnet via Alchemy
- Trade and collect story NFTs in the Marketplace
- Listen to AI-narrated stories via Sarvam AI Bulbul TTS (39 voices, 11 languages)

## Navigation
- **Prime** (Home): Landing page
- **Worlds** (Genres): Browse stories by genre
- **Forge** (Create): Story creation hub with 4 engines
- **Bazaar** (Marketplace): Buy, sell, and trade story NFTs
- **Commons** (Community): Community feed, creators, discussions
- **Atlas** (Docs): Documentation and guides
- **Gallery**: Community works archive
- **Dashboard**: Personal stats, stories, comics, NFTs, settings

## Creation Engines (Forge)
1. **VedaScript Engine**: AI-powered multi-chapter story generation with 70+ parameters. Supports genre selection, character design, plot structure, and world building.
2. **Panelra Engine**: Visual comic creation with sketch upload, character management, layout picker, and AI art generation.
3. **Mythloom Engine**: Coming soon — collaborative world building.
4. **Shakti Spark**: Quick idea/short-story generator with genre and mood selection.

## Wallet & NFT
- Connect via MetaMask or WalletConnect v2
- NFTs minted on Ethereum Mainnet (Chain ID 1)
- Contract: ComiCraftStoryNFT (ERC-721)
- CRAFTS token (ERC-20) for marketplace transactions
- Mint flow: Publish story → Submit mint request → Admin review → On-chain mint

## Authentication
- Email/password login via Supabase
- Google OAuth
- Wallet-based login (EIP-191 signature verification)

## TTS (Text-to-Speech)
- Powered by Sarvam AI Bulbul v3
- 39 speaker voices (Shubh, Priya, Simran, Rahul, Kavya, etc.)
- 11 languages (English, Hindi, Bengali, Tamil, Telugu, Gujarati, Kannada, Malayalam, Marathi, Punjabi, Odia)
- Adjustable pace (0.5x–2x) and sample rate
- Available on story detail pages via the Book View audio bar

## Common Issues & Troubleshooting
- **"System Offline"**: The backend may be cold-starting on Render. Wait 30-60 seconds and refresh.
- **Wallet won't connect**: Make sure MetaMask is installed and unlocked. Check you're on Ethereum Mainnet.
- **Story not showing**: Newly published stories appear immediately. Check the Gallery or your Profile.
- **TTS not generating**: Ensure you're logged in. TTS requires authentication.
- **Dashboard blank**: Your session may have expired. Sign out and sign back in.

## Support
- Website: https://comicraft.xyz
- GitHub: https://github.com/Drago-03/Comicraft-main
- Status page: https://stats.uptimerobot.com/PUi1I3YaBH

## Response Style
- Be friendly, helpful, and concise
- Use markdown formatting for clarity
- If you don't know something specific about the platform, say so honestly
- Keep responses focused on Comicraft features and functionality
- For technical issues, suggest practical troubleshooting steps`;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message, history = [] } = body;

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { reply: 'Please provide a message.' },
                { status: 400 }
            );
        }

        if (!GEMINI_API_KEY) {
            // Fallback when no API key is configured
            return NextResponse.json({
                reply: "I'm currently running in offline mode. Here are some quick links:\n\n" +
                    "- **Create a story**: Go to [Forge](/create)\n" +
                    "- **Browse stories**: Visit the [Gallery](/gallery)\n" +
                    "- **Connect wallet**: Click the wallet icon in the navbar\n" +
                    "- **Check status**: Visit our [Status Page](https://stats.uptimerobot.com/PUi1I3YaBH)\n\n" +
                    "For more help, check the [Atlas](/docs) documentation."
            });
        }

        // Build conversation for Gemini
        const contents = [];

        // Add conversation history
        for (const msg of history) {
            contents.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            });
        }

        // Add current user message
        contents.push({
            role: 'user',
            parts: [{ text: message }],
        });

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: SYSTEM_PROMPT }],
                    },
                    contents,
                    generationConfig: {
                        temperature: 0.7,
                        topP: 0.9,
                        topK: 40,
                        maxOutputTokens: 1024,
                    },
                    safetySettings: [
                        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
                        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
                        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
                        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
                    ],
                }),
            }
        );

        clearTimeout(timeout);

        if (!res.ok) {
            const errBody = await res.text();
            console.error('[MADHAVA] Gemini API error:', res.status, errBody);
            return NextResponse.json({
                reply: "I'm having trouble connecting to my brain right now. Please try again in a moment! 🧠",
            });
        }

        const data = await res.json();

        const reply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "I'm not sure how to answer that. Could you rephrase your question?";

        return NextResponse.json({ reply });
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
            return NextResponse.json({
                reply: 'My response timed out. Please try a shorter question!',
            });
        }
        console.error('[MADHAVA] Unexpected error:', error);
        return NextResponse.json({
            reply: "Something went wrong on my end. Please try again! 🔧",
        });
    }
}
