# AI Smart Support System

This module uses an AI agent powered by RAG (Retrieval-Augmented Generation) to answer user questions about the project instantly within the Pi App sandbox.

## 1. Architecture Flow
User Query -> Embedding Generation -> Vector DB Lookup -> LLM Response Engine -> Filtering and Guardrails -> Pi App Interface.

## 2. Backend Implementation (Node.js & AI Client SDK)
```javascript
// server/routes/smartSupport.js
const express = require('express');
const router = express.Router();

// Simulated Vector DB and LLM Generation
const generateAIResponse = async (userPrompt) => {
    // In production, integrate OpenAI/Anthropic/Ollama API
    const promptLower = userPrompt.toLowerCase();
    if (promptLower.includes('pi payment') || promptLower.includes('wallet')) {
        return "To make a payment, click 'Pay with Pi' inside our application. The Pi App will automatically launch your Pi Wallet to confirm.";
    }
    return "Thank you for contacting BIGISH-YER Support. Can you please clarify your issue so our automated assistant can guide you?";
};

router.post('/api/support/smart-chat', async (req, res) => {
    const { prompt, piUserId } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
    }

    try {
        const aiReply = await generateAIResponse(prompt);
        
        // Confidence Metric Score (Simulated)
        const confidenceScore = prompt.length > 5 ? 0.85 : 0.40;

        res.status(200).json({
            success: true,
            reply: aiReply,
            confidence: confidenceScore,
            should_escalate: confidenceScore < 0.50 // Trigger human support if confidence is low
        });
    } catch (error) {
        res.status(500).json({ error: "AI Engine error." });
    }
});

module.exports = router;
```
