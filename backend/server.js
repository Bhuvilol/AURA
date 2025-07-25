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
    console.log('Making chat request with Gemini API key length:', process.env.GEMINI_API_KEY?.length);
    console.log('API key starts with:', process.env.GEMINI_API_KEY?.substring(0, 10));
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent',
      {
        contents: [{ parts: [{ text: message }] }],
      },
      {
        headers: {
          'x-goog-api-key': process.env.GEMINI_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json({ reply: response.data.candidates[0].content.parts[0].text });
  } catch (err) {
    console.log('Chat API error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Gemini API error' });
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
    console.log('Making quote request with Gemini API key length:', process.env.GEMINI_API_KEY?.length);
    console.log('API key starts with:', process.env.GEMINI_API_KEY?.substring(0, 10));
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent',
      {
        contents: [{ parts: [{ text: 'Generate a short, original, motivational quote for students (max 15 words).' }] }],
      },
      {
        headers: {
          'x-goog-api-key': process.env.GEMINI_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json({ quote: response.data.candidates[0].content.parts[0].text.trim() });
  } catch (err) {
    console.log('Quote API error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Gemini API error' });
  }
});

app.get('/', (req, res) => {
  res.send('AURA Backend is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
