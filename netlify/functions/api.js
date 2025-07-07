const express = require('express');
const serverless = require('serverless-http');
const fetch = require('node-fetch');

// Express app ကိုတည်ဆောက်ခြင်း
const app = express();
const router = express.Router(); // Express Router ကိုသုံးပါမယ်

// Middleware များ
app.use(express.json());

// .env variable တွေက Netlify environment မှာ တိုက်ရိုက်ရပါမယ်
const { GEMINI_API_KEY, RELEVANCE_API_URL } = process.env;

// 1. Gemini API အတွက် Endpoint
router.post('/gemini', async (req, res) => {
    const { prompt } = req.body;
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    // ... (Gemini API call logic remains the same) ...
    try {
        const apiResponse = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await apiResponse.json();
        if (!apiResponse.ok) throw new Error(data.error.message);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Relevance AI အတွက် Endpoint
router.post('/relevance', async (req, res) => {
    const userData = req.body;
    const dataToSend = {
        project: "a7a4a343-9152-427d-85dd-46a663e653b6",
        params: userData
    };
    // ... (Relevance AI call logic remains the same) ...
    try {
        const apiResponse = await fetch(RELEVANCE_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSend)
        });
        const data = await apiResponse.json();
        if (!apiResponse.ok) throw new Error(data.message || 'Error from Relevance AI service');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Router ကို path အောက်မှာ သတ်မှတ်ပေးခြင်း
app.use('/.netlify/functions/api', router);

// serverless-http ဖြင့် app ကို export လုပ်ခြင်း
module.exports.handler = serverless(app);