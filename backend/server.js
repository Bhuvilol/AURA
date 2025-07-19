import dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import multer from 'multer';
import FormData from 'form-data';

dotenv.config();

// Debug logging
console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('OPENROUTER_API_KEY exists:', !!process.env.OPENROUTER_API_KEY);
console.log('OPENROUTER_API_KEY length:', process.env.OPENROUTER_API_KEY?.length);

const upload = multer();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  try {
    console.log('Making chat request with API key length:', process.env.OPENROUTER_API_KEY?.length);
    console.log('API key starts with:', process.env.OPENROUTER_API_KEY?.substring(0, 10));
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3.1-8b-instruct:free',
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
    console.log('Chat API error:', err.response?.data || err.message);
    res.status(500).json({ error: 'OpenRouter API error' });
  }
});

// Simple test endpoint that doesn't require external APIs
app.get('/api/test-quote', async (req, res) => {
  try {
    const quotes = [
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      "The only way to do great work is to love what you do.",
      "Education is the most powerful weapon which you can use to change the world.",
      "Believe you can and you're halfway there.",
      "The future belongs to those who believe in the beauty of their dreams."
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    res.json({ quote: randomQuote });
  } catch (err) {
    console.log('Test quote error:', err.message);
    res.status(500).json({ error: 'Test quote error' });
  }
});

// PDF text extraction using simple text processing
app.post('/api/pdf-extract', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  try {
    console.log('Processing PDF file:', req.file.originalname);
    console.log('File size:', req.file.size, 'bytes');
    
    // For now, return a mock response since we can't parse PDFs locally
    // In a real implementation, you would use a PDF parsing library
    const mockText = `Sample extracted text from ${req.file.originalname}

This is a demonstration of PDF text extraction. In a production environment, this would contain the actual text extracted from your PDF file.

The PDF parsing functionality is working, but currently returns sample text for demonstration purposes. To implement full PDF parsing, you would need to:

1. Install a PDF parsing library like pdf-parse
2. Process the uploaded file buffer
3. Extract and clean the text
4. Return the processed text

For now, you can use this sample text to test the summarization and flashcard generation features.`;
    
    res.json({ 
      text: mockText,
      textLength: mockText.length,
      note: "This is sample text. Real PDF parsing would extract actual content."
    });
    
  } catch (err) {
    console.log('PDF parsing error:', err.message);
    res.status(500).json({ 
      error: 'PDF text extraction failed. Please try again.',
      details: err.message
    });
  }
});

app.get('/api/quote', async (req, res) => {
  try {
    console.log('Making quote request with API key length:', process.env.OPENROUTER_API_KEY?.length);
    console.log('API key starts with:', process.env.OPENROUTER_API_KEY?.substring(0, 10));
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          { role: 'user', content: 'Generate a short, original, motivational quote for students (max 15 words).' }
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
    console.log('Quote API error:', err.response?.data || err.message);
    res.status(500).json({ error: 'OpenRouter API error' });
  }
});

app.get('/api/simple-test', async (req, res) => {
  try {
    console.log('Simple test - API key status:');
    console.log('API key exists:', !!process.env.OPENROUTER_API_KEY);
    console.log('API key length:', process.env.OPENROUTER_API_KEY?.length);
    console.log('API key starts with:', process.env.OPENROUTER_API_KEY?.substring(0, 10));
    
    res.json({ 
      success: true, 
      message: 'Simple test passed',
      apiKeyExists: !!process.env.OPENROUTER_API_KEY,
      apiKeyLength: process.env.OPENROUTER_API_KEY?.length,
      apiKeyPrefix: process.env.OPENROUTER_API_KEY?.substring(0, 10)
    });
  } catch (err) {
    console.log('Simple test error:', err.message);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

app.get('/api/test-chat', async (req, res) => {
  try {
    console.log('Testing chat completion...');
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [{ role: 'user', content: 'Say hello' }],
        max_tokens: 10
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json({ 
      success: true, 
      message: 'Chat completion works',
      response: response.data.choices[0].message.content
    });
  } catch (err) {
    console.log('Chat test error:', err.response?.data || err.message);
    res.status(500).json({ 
      success: false, 
      error: err.response?.data || err.message 
    });
  }
});

app.get('/api/test-key', async (req, res) => {
  try {
    console.log('Testing API key...');
    const response = await axios.get(
      'https://openrouter.ai/api/v1/models',
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json({ 
      success: true, 
      message: 'API key is valid',
      models: response.data.data?.length || 0
    });
  } catch (err) {
    console.log('API key test error:', err.response?.data || err.message);
    res.status(500).json({ 
      success: false, 
      error: err.response?.data || err.message 
    });
  }
});

app.get('/', (req, res) => {
  res.send('AURA Backend is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 