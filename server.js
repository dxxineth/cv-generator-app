// လိုအပ်သော package များကို import လုပ်ခြင်း
const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config(); // .env ဖိုင်ထဲက variable တွေကို load လုပ်ရန်

// Express app ကိုတည်ဆောက်ခြင်း
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware များ
app.use(express.json()); // Frontend ကပို့လိုက်တဲ့ JSON data တွေကို နားလည်ရန်
app.use(express.static('public')); // 'public' folder ထဲက static file တွေကို serve လုပ်ရန်

// .env ဖိုင်ထဲက API Key တွေကို ရယူခြင်း
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const RELEVANCE_API_URL = process.env.RELEVANCE_API_URL;

// 1. Gemini API အတွက် Backend Endpoint
app.post('/api/gemini', async (req, res) => {
    // Frontend ကပို့လိုက်တဲ့ prompt ကိုလက်ခံခြင်း
    const { prompt } = req.body;

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GOOGLE_AI_API_KEY_HERE') {
        return res.status(500).json({ error: 'Gemini API key is not configured correctly on the server. Please check your .env file.' });
    }
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
    }

    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
        contents: [{ parts: [{ text: prompt }] }]
    };

    try {
        const apiResponse = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await apiResponse.json();
        if (!apiResponse.ok) {
            console.error('Gemini API Error:', data);
            // Gemini ကပြန်လာတဲ့ error message ကို တိုက်ရိုက်ပြသခြင်း
            throw new Error(data.error.message);
        }
        
        // အောင်မြင်ပါက ရလဒ်ကို Frontend သို့ပြန်ပို့ပေးခြင်း
        res.json(data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Relevance AI အတွက် Backend Endpoint
app.post('/api/relevance', async (req, res) => {
    const userData = req.body;

    if (!RELEVANCE_API_URL) {
        return res.status(500).json({ error: 'Relevance API URL is not configured on the server.' });
    }

    // *** FIX: Relevance AI အတွက် လိုအပ်သော project ID ကို ထည့်သွင်းခြင်း ***
    const dataToSend = {
        // သင်၏ မူလ screenshot ထဲမှ project ID ကို ထည့်သွင်းထားပါသည်
        project: "a7a4a343-9152-427d-85dd-46a663e653b6", 
        // Frontend ကပို့လိုက်တဲ့ user data ကို params အောက်မှာထည့်ပေးခြင်း
        params: userData 
    };

    try {
        const apiResponse = await fetch(RELEVANCE_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSend) // ပြင်ဆင်ထားသော data ကိုပို့ခြင်း
        });

        const data = await apiResponse.json();
        if (!apiResponse.ok) {
            console.error('Relevance API Error:', data);
            throw new Error(data.message || 'Error from Relevance AI service');
        }
        
        res.json(data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Server ကို စတင် run ခြင်း
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});