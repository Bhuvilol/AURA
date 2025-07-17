const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const upload = multer();
const FormData = require('form-data');
const pdfParse = require('pdf-parse');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mistral-7b-instruct:free', // You can change to other free models listed on OpenRouter
        messages: [{ role: 'user', content: message }],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json({ reply: response.data.choices[0].message.content });
  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).json({ error: 'OpenRouter API error' });
  }
});

// PDF.co PDF text extraction endpoint
app.post('/api/pdf-extract', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const data = await pdfParse(req.file.buffer);
    res.json({ text: data.text });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'PDF parsing error' });
  }
});

app.get('/api/quote', async (req, res) => {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates short, original, motivational quotes for students.' },
          { role: 'user', content: 'Generate a short, original, motivational quote for students. The quote must be no more than 15 words.' }
        ],
        max_tokens: 60
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json({ quote: response.data.choices[0].message.content.trim() });
  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).json({ error: 'OpenRouter API error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 