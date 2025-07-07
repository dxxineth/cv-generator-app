const express = require('express');
const serverless = require('serverless-http');
const fetch = require('node-fetch');

const app = express();
const router = express.Router();
app.use(express.json());

// Get environment variables from Netlify
const { GEMINI_API_KEY, RELEVANCE_API_URL } = process.env;

router.post('/relevance', async (req, res) => {
    // --- START DEBUGGING LOGS ---
    console.log("--- Relevance AI Function Triggered ---");
    if (!RELEVANCE_API_URL) {
        console.error("FATAL: RELEVANCE_API_URL is not set in Netlify environment variables.");
        return res.status(500).json({ error: "Server configuration error: RELEVANCE_API_URL is missing." });
    }
    console.log("RELEVANCE_API_URL is present.");
    // --- END DEBUGGING LOGS ---

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
            console.error('Relevance AI API Error:', data);
            throw new Error(data.message || 'Error from Relevance AI service');
        }
        console.log("Successfully fetched from Relevance AI.");
        res.json(data);
    } catch (error) {
        console.error('Catch Block Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add other routes like /gemini if needed

app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);
