require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const Groq = require('groq-sdk');

const bot = new Telegraf(process.env.BOT_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// =====================================================
// NOTE ON QUOTE SOURCE:
// All quotes below are 100% AI-GENERATED live by Groq (llama-3.3-70b-versatile).
// They are NOT pulled from a real-quotes database, so they should not be
// presented as verified quotes from real authors — that's why prompts say
// "in the style of" instead of claiming the real person said it.
// =====================================================

// =====================================================
// 1. QUOTE CATEGORIES (flat dict, ~37 types) + GROUPS (for menu layout)
// =====================================================
const QUOTE_CATEGORIES = {
    // --- Emotions & Feelings ---
    emotional: { label: '😢 Emotional', prompt: 'Generate a deeply emotional quote about human feelings, heartbreak, or inner struggle.' },
    sad: { label: '💧 Sad', prompt: 'Generate a melancholic, sad quote about loss, pain, or moving on.' },
    lonely: { label: '🌙 Lonely', prompt: 'Generate a quote about loneliness, solitude, and self-reflection.' },
    dark: { label: '🖤 Dark', prompt: 'Generate a dark, intense quote about human nature, power, or the shadows of the mind.' },
    anxious: { label: '😰 Anxious', prompt: 'Generate a quote about anxiety, overthinking, and racing thoughts, with an underlying note of hope.' },
    heartbroken: { label: '💔 Heartbroken', prompt: 'Generate a quote about heartbreak and the pain of a broken relationship.' },

    // --- Love & Relationships ---
    love: { label: '❤️ Love', prompt: 'Generate a heartfelt, romantic love quote.' },
    breakup: { label: '🖤 Breakup', prompt: 'Generate a quote about breakups, letting go, and moving on from a relationship.' },
    missingsomeone: { label: '🥺 Missing Someone', prompt: 'Generate a quote about missing someone you love or care about.' },
    friendship: { label: '🤝 Friendship', prompt: 'Generate a warm quote about true friendship and loyalty.' },
    trust: { label: '🔒 Trust', prompt: 'Generate a quote about trust, being trustworthy, or trust being broken.' },
    betrayal: { label: '🗡️ Betrayal', prompt: 'Generate a sharp quote about betrayal and being let down by someone close.' },

    // --- Motivation & Success ---
    motivational: { label: '💪 Motivational', prompt: 'Generate a powerful motivational quote to inspire someone to take action.' },
    success: { label: '💼 Success', prompt: 'Generate a hardcore success and wealth mindset quote.' },
    hustle: { label: '⚙️ Hustle', prompt: 'Generate an intense quote about hustle, hard work, and grinding toward goals.' },
    discipline: { label: '🎯 Discipline', prompt: 'Generate a sharp quote about discipline, consistency, and self-control.' },
    confidence: { label: '😎 Confidence', prompt: 'Generate a bold quote about self-confidence and self-belief.' },
    dreams: { label: '🌠 Dreams', prompt: 'Generate an inspiring quote about chasing dreams and ambition.' },

    // --- Attitude & Fun ---
    savage: { label: '🔥 Savage', prompt: 'Generate a bold, savage, unapologetic attitude quote.' },
    funny: { label: '😂 Funny', prompt: 'Generate a witty, funny one-liner quote that makes people laugh.' },
    sarcastic: { label: '🙃 Sarcastic', prompt: 'Generate a sharp, sarcastic quote with a dry sense of humor.' },
    attitude: { label: '🕶️ Attitude', prompt: "Generate a confident, don't-care-what-people-think attitude quote." },
    flirty: { label: '😉 Flirty', prompt: 'Generate a playful, flirty, charming quote (keep it tasteful, not explicit).' },

    // --- Life & Wisdom ---
    lifelessons: { label: '📘 Life Lessons', prompt: 'Generate a thoughtful quote about an important life lesson.' },
    wisdom: { label: '🦉 Wisdom', prompt: 'Generate a wise, timeless quote about human experience.' },
    patience: { label: '⏳ Patience', prompt: 'Generate a quote about patience and waiting for the right time.' },
    karma: { label: '☯️ Karma', prompt: 'Generate a quote about karma, cause and effect, and what goes around comes around.' },
    time: { label: '⏰ Time', prompt: 'Generate a reflective quote about time, its value, and how it changes everything.' },

    // --- Spiritual & Peace ---
    spiritual: { label: '🕉️ Spiritual', prompt: 'Generate a spiritual quote about the soul, purpose, or higher meaning.' },
    peace: { label: '🕊️ Peace', prompt: 'Generate a calming quote about inner peace and letting go of chaos.' },
    gratitude: { label: '🙏 Gratitude', prompt: 'Generate a quote about gratitude and appreciating what you have.' },
    faith: { label: '✨ Faith', prompt: 'Generate a quote about faith, belief, and trusting the process.' },
    mindfulness: { label: '🧘 Mindfulness', prompt: 'Generate a quote about mindfulness, being present, and living in the moment.' },

    // --- Creative & Literary ---
    anime: { label: '🍥 Anime', prompt: 'Generate a powerful quote inspired by legendary anime characters (like Aizen, Eren, Itachi, Luffy, or Lelouch) about power, reality, or ambition.' },
    poet: { label: '🖋️ Poetic', prompt: 'Generate a poetic, lyrical quote with vivid imagery, in the style of a modern poet.' },
    topwriter: { label: '📚 Top Writer Style', prompt: 'Generate a profound original quote in the style of a legendary writer (like Rumi, Hemingway, or Shakespeare) about life, truth, or meaning. Do not claim it is a real quote from them.' },
    shayari: { label: '📜 Shayari', prompt: 'Generate a short two-line Hindi/Urdu-style shayari (romantic or emotional), written in Hinglish (Roman script).' },
};

const QUOTE_GROUPS = [
    { key: 'emotions', label: '😢 Emotions & Feelings', categories: ['emotional', 'sad', 'lonely', 'dark', 'anxious', 'heartbroken'] },
    { key: 'relationships', label: '❤️ Love & Relationships', categories: ['love', 'breakup', 'missingsomeone', 'friendship', 'trust', 'betrayal'] },
    { key: 'motivation', label: '🚀 Motivation & Success', categories: ['motivational', 'success', 'hustle', 'discipline', 'confidence', 'dreams'] },
    { key: 'attitude', label: '🔥 Attitude & Fun', categories: ['savage', 'funny', 'sarcastic', 'attitude', 'flirty'] },
    { key: 'wisdom', label: '📖 Life & Wisdom', categories: ['lifelessons', 'wisdom', 'patience', 'karma', 'time'] },
    { key: 'spiritual', label: '🕉️ Spiritual & Peace', categories: ['spiritual', 'peace', 'gratitude', 'faith', 'mindfulness'] },
    { key: 'literary', label: '🖋️ Creative & Literary', categories: ['anime', 'poet', 'topwriter', 'shayari'] },
];

const backupQuotes = [
    '"The world isn\'t beautiful, it is beautiful even so." — Kino\'s Journey',
    '"If you don\'t take risks, you can\'t create a future." — Monkey D. Luffy',
    '"Stay hungry, stay foolish." — Steve Jobs'
];

// =====================================================
// 2. PER-USER STATE (in-memory — swap for a DB in production)
// =====================================================
const userQuoteHistory = new Map();    // userId -> { categoryOrTopicKey: [quote, ...] }
const awaitingCustomTopic = new Set(); // userIds currently being asked "what topic?"
const lastCustomTopic = new Map();     // userId -> last custom topic string (for "Another" button)

function getHistory(userId, key) {
    if (!userQuoteHistory.has(userId)) userQuoteHistory.set(userId, {});
    const userData = userQuoteHistory.get(userId);
    if (!userData[key]) userData[key] = [];
    return userData[key];
}

function saveToHistory(userId, key, quote) {
    const history = getHistory(userId, key);
    history.push(quote);
    if (history.length > 8) history.shift();
}

// =====================================================
// 3. INTENT DETECTION
// =====================================================
const GREETING_REGEX = /^(hi+|hey+|hello+|yo+|sup|namaste|salam|kaise ho|kya haal|good\s?(morning|afternoon|evening))\b/i;
const QUOTE_REQUEST_REGEX = /\b(quote|quotes|shayari|shayri|shayr)\b/i;
const CUSTOM_TOPIC_REGEX = /\bquotes?\s+(?:about|on|for)\s+(.+)/i;

const GREETING_REPLIES = [
    'Hey! How can I help you today? 😊',
    'Hello there! What can I do for you?',
    "Hey hey! I'm here — need a quote or just wanna chat?"
];

// =====================================================
// 4. KEYBOARD BUILDERS
// =====================================================
function buildGroupsKeyboard() {
    const rows = QUOTE_GROUPS.map((g) => [Markup.button.callback(g.label, `grp_${g.key}`)]);
    rows.push([Markup.button.callback('🎯 Custom Topic (type anything)', 'custom_topic')]);
    return Markup.inlineKeyboard(rows);
}

function buildCategoryKeyboard(groupKey) {
    const group = QUOTE_GROUPS.find((g) => g.key === groupKey);
    const buttons = group.categories.map((catKey) =>
        Markup.button.callback(QUOTE_CATEGORIES[catKey].label, `cat_${catKey}`)
    );
    const rows = [];
    for (let i = 0; i < buttons.length; i += 2) rows.push(buttons.slice(i, i + 2));
    rows.push([Markup.button.callback('⬅️ Back', 'main_menu')]);
    return Markup.inlineKeyboard(rows);
}

// =====================================================
// 5. /start AND /help
// =====================================================
bot.start((ctx) => {
    ctx.reply(
        'Hey! 👋 I can send you quotes on demand, or just chat with you.\nPick a category, or type "quote about <anything>" for a custom one:',
        buildGroupsKeyboard()
    );
});

bot.help((ctx) => {
    ctx.reply(
        "Here's what I can do:\n" +
        '• Say "hi" / "hey" — I\'ll greet you back\n' +
        '• Say "quote" — I\'ll show you category groups\n' +
        '• Say "quote about <topic>" — I\'ll write one on any topic\n' +
        '• Anything else — I\'ll just chat with you\n' +
        '• /start — see the quote menu'
    );
});

// =====================================================
// 6. NAVIGATION: groups -> categories -> back
// =====================================================
bot.action('main_menu', (ctx) => {
    ctx.editMessageText('Pick a category group:', buildGroupsKeyboard());
});

QUOTE_GROUPS.forEach((group) => {
    bot.action(`grp_${group.key}`, (ctx) => {
        ctx.editMessageText(`${group.label} — pick a type:`, buildCategoryKeyboard(group.key));
    });
});

bot.action('custom_topic', (ctx) => {
    awaitingCustomTopic.add(ctx.from.id);
    ctx.editMessageText('Type the topic you want a quote about (e.g. "courage", "rain", "coding") 👇');
});

// =====================================================
// 7. QUOTE GENERATION (shared by category buttons + custom topics)
// =====================================================
Object.keys(QUOTE_CATEGORIES).forEach((key) => {
    bot.action(`cat_${key}`, async (ctx) => {
        const category = QUOTE_CATEGORIES[key];
        await generateAndRespond(ctx, {
            prompt: category.prompt,
            label: category.label,
            historyKey: key,
            fromCallback: true,
            againCallbackData: `cat_${key}`,
        });
    });
});

bot.action('custom_again', async (ctx) => {
    const topic = lastCustomTopic.get(ctx.from.id);
    if (!topic) return ctx.answerCbQuery('No previous topic found, type a new one!');
    await generateAndRespond(ctx, {
        prompt: `Generate an original quote about "${topic}".`,
        label: `🎯 ${topic}`,
        historyKey: `custom:${topic.toLowerCase()}`,
        fromCallback: true,
        againCallbackData: 'custom_again',
    });
});

async function generateAndRespond(ctx, { prompt, label, historyKey, fromCallback, againCallbackData }) {
    const userId = ctx.from.id;
    let placeholderMsg;

    if (fromCallback) {
        await ctx.editMessageText(`🤖 _Finding a fresh ${label} quote..._`, { parse_mode: 'Markdown' }).catch(() => {});
    } else {
        placeholderMsg = await ctx.reply(`🤖 Finding a fresh ${label} quote...`);
    }

    const history = getHistory(userId, historyKey);
    const avoidText = history.length
        ? `\n\nDo NOT repeat any of these quotes you already gave this user:\n${history.map((q) => `- ${q}`).join('\n')}`
        : '';

    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🔄 Another one', againCallbackData)],
        [Markup.button.callback('🏠 Back to categories', 'main_menu')]
    ]);

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are an elite curator of powerful, original quotes. Never sound generic. Every quote must be unique — never repeat a previous one for the same user. Never falsely attribute a fabricated quote to a real, identifiable person.'
                },
                { role: 'user', content: prompt + avoidText }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 1.1,
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content?.trim()
            || backupQuotes[Math.floor(Math.random() * backupQuotes.length)];

        saveToHistory(userId, historyKey, aiResponse);
        const finalText = `*${label}*\n\n"${aiResponse}"`;

        if (fromCallback) {
            await ctx.editMessageText(finalText, { parse_mode: 'Markdown', ...keyboard });
        } else {
            await ctx.telegram.editMessageText(ctx.chat.id, placeholderMsg.message_id, undefined, finalText, {
                parse_mode: 'Markdown', ...keyboard
            });
        }
    } catch (error) {
        console.error('Groq API Error:', error.message);
        const randomBackup = backupQuotes[Math.floor(Math.random() * backupQuotes.length)];
        const backupText = `*${label} (offline backup)*\n\n"${randomBackup}"`;
        if (fromCallback) {
            await ctx.editMessageText(backupText, { parse_mode: 'Markdown', ...keyboard }).catch(() => {});
        } else {
            await ctx.telegram.editMessageText(ctx.chat.id, placeholderMsg.message_id, undefined, backupText, {
                parse_mode: 'Markdown', ...keyboard
            }).catch(() => {});
        }
    }
}

// =====================================================
// 8. MAIN TEXT HANDLER — routes based on intent
// =====================================================
bot.on('text', async (ctx) => {
    const text = ctx.message.text.trim();
    const userId = ctx.from.id;

    // 0) We already asked "what topic?" -> treat this message as the topic
    if (awaitingCustomTopic.has(userId)) {
        awaitingCustomTopic.delete(userId);
        lastCustomTopic.set(userId, text);
        return generateAndRespond(ctx, {
            prompt: `Generate an original quote about "${text}".`,
            label: `🎯 ${text}`,
            historyKey: `custom:${text.toLowerCase()}`,
            fromCallback: false,
            againCallbackData: 'custom_again',
        });
    }

    // 1) "quote about X" / "quote on X" -> direct custom topic, no menu needed
    const customMatch = text.match(CUSTOM_TOPIC_REGEX);
    if (customMatch) {
        const topic = customMatch[1].trim();
        lastCustomTopic.set(userId, topic);
        return generateAndRespond(ctx, {
            prompt: `Generate an original quote about "${topic}".`,
            label: `🎯 ${topic}`,
            historyKey: `custom:${topic.toLowerCase()}`,
            fromCallback: false,
            againCallbackData: 'custom_again',
        });
    }

    // 2) Greeting -> fixed friendly reply, no API call needed
    if (GREETING_REGEX.test(text)) {
        const reply = GREETING_REPLIES[Math.floor(Math.random() * GREETING_REPLIES.length)];
        return ctx.reply(reply);
    }

    // 3) Generic quote request -> show group menu
    if (QUOTE_REQUEST_REGEX.test(text)) {
        return ctx.reply('Sure! Pick a category group:', buildGroupsKeyboard());
    }

    // 4) Everything else -> casual AI chat
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a witty, friendly AI companion. Reply naturally and helpfully, with light humor when appropriate. Keep replies short (max 2-3 lines).'
                },
                { role: 'user', content: text }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.9,
        });
        const replyText = chatCompletion.choices[0]?.message?.content?.trim()
            || 'Hmm, my brain lagged there. Try again?';
        ctx.reply(replyText);
    } catch (err) {
        console.error('Groq API Error:', err.message);
        ctx.reply('My brain lagged trying to process that. Try again in a bit!');
    }
});

// =====================================================
// 9. BOT LAUNCH
// =====================================================
bot.launch();
console.log('🚀 Bot running: greetings + grouped quote menu (37 types) + custom-topic quotes + repeat protection!');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
