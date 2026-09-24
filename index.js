require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const Groq = require('groq-sdk');
const express = require('express'); // 1. Express import kiya

// Initialize Express (Render ke port requirement ke liye)
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🤖 Telegram Bot is alive and running on Render!');
});

app.listen(PORT, () => {
    console.log(`🌐 Web server is listening on port ${PORT}`);
});

// Initialize Bot and Groq client
const bot = new Telegraf(process.env.BOT_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Start Command
bot.start((ctx) => {
    ctx.reply(
        '🚀 Welcome to the Ultimate Real-World Quote Bot!\nClick below to get a 100% verified quote from the universe:',
        Markup.inlineKeyboard([
            [Markup.button.callback('✨ Get a Random Real Quote', 'fetch_real_quote')],
            [Markup.button.callback('🔥 Savage AI Quote', 'fetch_savage_quote')]
        ])
    );
});

// 1. Fetch Real Verified Quote
bot.action('fetch_real_quote', async (ctx) => {
    try {
        await ctx.editMessageText('🔍 Fetching a verified quote from the global database...').catch(() => {});
        
        const response = await fetch('https://api.quotable.io/random');
        const data = await response.json();

        const quote = data.content;
        const author = data.author;

        const keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('🔄 Another One', 'fetch_real_quote')],
            [Markup.button.callback('🏠 Home Menu', 'home_menu')]
        ]);

        await ctx.editMessageText(`📜 *Verified Quote:*\n\n"${quote}"\n— *${author}*`, {
            parse_mode: 'Markdown',
            ...keyboard
        });
    } catch (error) {
        console.error('API Error:', error.message);
        ctx.editMessageText('❌ Failed to fetch from API. Try again later!').catch(() => {});
    }
});

// 2. Real Quote + Groq AI Savage Twist
bot.action('fetch_savage_quote', async (ctx) => {
    try {
        await ctx.editMessageText('🤖 Fetching a real quote and giving it a savage AI makeover...').catch(() => {});

        const response = await fetch('https://api.quotable.io/random');
        const data = await response.json();
        const quote = data.content;
        const author = data.author;

        const prompt = `Here is a real quote by ${author}: "${quote}". Give a short, funny, and witty savage reaction to this in a modern tech-bro English tone.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
        });

        const savageReaction = completion.choices[0]?.message?.content || 'No comments!';

        const keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('🔄 Another Savage One', 'fetch_savage_quote')],
            [Markup.button.callback('🏠 Home Menu', 'home_menu')]
        ]);

        const finalText = `📜 *Original:* "${quote}" — *${author}*\n\n🤖 *Savage Take:* ${savageReaction}`;

        await ctx.editMessageText(finalText, {
            parse_mode: 'Markdown',
            ...keyboard
        });
    } catch (error) {
        console.error('Groq/API Error:', error.message);
        ctx.editMessageText('❌ Locha ho gaya bhai. Try again!').catch(() => {});
    }
});

// Home Menu Handler
bot.action('home_menu', (ctx) => {
    ctx.editMessageText(
        '🚀 Choose an option:',
        Markup.inlineKeyboard([
            [Markup.button.callback('✨ Get a Random Real Quote', 'fetch_real_quote')],
            [Markup.button.callback('🔥 Savage AI Quote', 'fetch_savage_quote')]
        ])
    );
});

// Launch Bot
bot.launch();
console.log('🚀 Telegram Bot successfully running with Express port binding!');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
