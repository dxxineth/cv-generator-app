// လိုအပ်သော package များကို import လုပ်ခြင်း
const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config(); // .env ဖိုင်ထဲက variable တွေကို load လုပ်ရန်

// Express app ကိုတည်ဆောက်ခြင်း
const app = express();
// *** FIX: Render က သတ်မှတ်ပေးတဲ့ PORT ကို တိုက်ရိုက်အသုံးပြုရန် ပြင်ဆင်ထားသည် ***
const PORT = process.env.PORT || 10000; // Render ၏ default port 10000 ကို fallback အဖြစ်သုံးပါ

// Middleware များ
app.use(express.json()); // Frontend ကပို့လိုက်တဲ့ JSON data တွေကို နားလည်ရန်
app.use(express.static('public')); // 'public' folder ထဲက static file တွေကို serve လုပ်ရန်

// .env ဖိုင်ထဲက API Key တွေကို ရယူခြင်း
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const RELEVANCE_API_URL = process.env.RELEVANCE_API_URL;

// Gemini API အတွက် Backend Endpoint
app.post('/api/gemini', async (req, res) => {
    // ... (ဤအပိုင်းရှိ ကုဒ်များ မပြောင်းလဲပါ) ...
});

// Relevance AI အတွက် Backend Endpoint
app.post('/api/relevance', async (req, res) => {
    // ... (ဤအပိုင်းရှိ ကုဒ်များ မပြောင်းလဲပါ) ...
});


// Server ကို စတင် run ခြင်း
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
