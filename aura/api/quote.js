import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent',
        {
          contents: [
            { parts: [ { text: 'Generate a short, original, motivational quote for students. The quote must be no more than 15 words.' } ] }
          ]
        },
        {
          headers: {
            'x-goog-api-key': process.env.GEMINI_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      res.status(200).json({ quote: response.data.candidates[0].content.parts[0].text.trim() });
    } catch (err) {
      console.log(err.response?.data || err.message);
      res.status(500).json({ error: 'OpenRouter API error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 