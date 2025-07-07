const express = require('express');
const serverless = require('serverless-http');
const fetch = require('node-fetch');

// Express app ကိုတည်ဆောက်ခြင်း
const app = express();
const router = express.Router();

// Middleware များ
app.use(express.json());

// .env variable တွေက Netlify environment မှာ တိုက်ရိုက်ရပါမယ်
const { GEMINI_API_KEY, RELEVANCE_API_URL } = process.env;

// Relevance AI အတွက် Endpoint
router.post('/relevance', async (req, res) => {
    const userData = req.body;
    const dataToSend = {
        project: "a7a4a343-9152-427d-85dd-46a663e653b6",
        params: userData
    };
    try {
        const apiResponse = await fetch(RELEVANCE_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSend)
        });
        const data = await apiResponse.json();
        if (!apiResponse.ok) {
            console.error('Relevance AI Error:', data);
            throw new Error(data.message || 'Error from Relevance AI service');
        }
        res.json(data);
    } catch (error) {
        console.error('Catch Block Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Gemini API အတွက် Endpoint (အကယ်၍ ပြန်သုံးမည်ဆိုလျှင်)
// router.post('/gemini', ...);

// Router ကို path အောက်မှာ သတ်မှတ်ပေးခြင်း
app.use('/.netlify/functions/api', router);

// serverless-http ဖြင့် app ကို export လုပ်ခြင်း
module.exports.handler = serverless(app);