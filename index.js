require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const Groq = require('groq-sdk');

const bot = new Telegraf(process.env.BOT_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// Fallback Legends
const backupLegends = [
    "“The world isn't beautiful, it is beautiful even so.” — Kino's Journey",
    "“If you don't take risks, you can't create a future.” — Monkey D. Luffy",
    "“Stay hungry, stay foolish.” — Steve Jobs"
];

// 1. /start Command (Elite Menu)
bot.start((ctx) => {
    ctx.reply(
        "Look who decided to show up! 😎 Ready to get inspired or should I just roast you? Choose your poison:",
        Markup.inlineKeyboard([
            [Markup.button.callback('🍥 Anime Savage & Wisdom', 'cat_anime')],
            [Markup.button.callback('💼 Hustle & Success Tycoons', 'cat_success')],
            [Markup.button.callback('🔥 Dark Psychology & Attitude', 'cat_attitude')],
            [Markup.button.callback('✨ Deep Philosophical Vibes', 'cat_shayari')]
        ])
    );
});

// 2. Category Button Handlers
bot.action('cat_anime', async (ctx) => {
    await generateEliteAI(
        ctx, 
        "Generate a powerful, iconic quote or philosophy inspired by legendary anime characters (like Aizen, Eren, Itachi, or Lelouch) about power, reality, or ambition. Keep it punchy, max 3 lines, with a cool anime vibe. No extra text.", 
        '🍥 Anime Legend Wisdom'
    );
});

bot.action('cat_success', async (ctx) => {
    await generateEliteAI(
        ctx, 
        "Generate a hardcore, elite success or wealth mindset quote inspired by titans like Steve Jobs, Elon Musk, or Andrew Tate. Sharp, aggressive, and deeply motivating. Max 2 lines. No extra text.", 
        '💼 Success Tycoon Mindset'
    );
});

bot.action('cat_attitude', async (ctx) => {
    await generateEliteAI(
        ctx, 
        "Generate a highly savage, dark psychology or cold-hearted attitude quote in English. Unapologetic and elite. Max 2 lines. No extra text.", 
        '🔥 Dark Attitude Mode'
    );
});

bot.action('cat_shayari', async (ctx) => {
    await generateEliteAI(
        ctx, 
        "Generate a deep, emotionally striking philosophy quote about solitude, hustle, or human nature. Max 3 lines. No extra text.", 
        '✨ Deep Philosophical Vibes'
    );
});

// Core AI Generator Function
async function generateEliteAI(ctx, promptText, title) {
    await ctx.editMessageText("🤖 _Consulting the anime & business legends..._ ⚡", { parse_mode: 'Markdown' }).catch(() => {});

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are an elite curator of powerful quotes from anime legends, master strategists, and multi-millionaires. Never sound generic. Always make it sound profound, sharp, and impactful." },
                { role: "user", content: promptText }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 1.3,
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content || backupLegends[Math.floor(Math.random() * backupLegends.length)];

        await ctx.editMessageText(
            `*${title}* \n\n"${aiResponse}"`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('🔄 Give Another Legend', ctx.callbackQuery.data)],
                    [Markup.button.callback('🏠 Main Menu', 'main_menu')]
                ])
            }
        );
    } catch (error) {
        console.error("Groq API Error:", error.message);
        const randomBackup = backupLegends[Math.floor(Math.random() * backupLegends.length)];
        await ctx.editMessageText(
            `*${title} (Backup Mode)* \n\n"${randomBackup}"`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('🔄 Give Another Legend', ctx.callbackQuery.data)],
                    [Markup.button.callback('🏠 Main Menu', 'main_menu')]
                ])
            }
        ).catch(() => {});
    }
}

// Main Menu Button Handler
bot.action('main_menu', (ctx) => {
    ctx.editMessageText(
        "Back to the menu already? Too scared of a real challenge? Pick a category:",
        Markup.inlineKeyboard([
            [Markup.button.callback('🍥 Anime Savage & Wisdom', 'cat_anime')],
            [Markup.button.callback('💼 Hustle & Success Tycoons', 'cat_success')],
            [Markup.button.callback('🔥 Dark Psychology & Attitude', 'cat_attitude')],
            [Markup.button.callback('✨ Deep Philosophical Vibes', 'cat_shayari')]
        ])
    );
});

// 3. Funny, Teasing & Savage English Chat Handler
bot.on('text', async (ctx) => {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: "You are a hilarious, witty, and savage AI companion who speaks ONLY in English. Your job is to playfully tease, roast, and mock the user while keeping it funny and engaging. Never be boring. Keep your replies short (max 2 lines)." 
                },
                { role: "user", content: ctx.message.text }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 1.2,
        });
        const replyText = chatCompletion.choices[0]?.message?.content || "Did you break the matrix or just your keyboard? Try /start.";
        ctx.reply(replyText);
    } catch (err) {
        ctx.reply("My brain lagged trying to process that nonsense. Hit /start and try again.");
    }
});

// Bot Launch
bot.launch();
console.log('🚀 Savage & Funny English AI Bot successfully running!');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));