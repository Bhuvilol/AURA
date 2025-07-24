import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { message } = req.body;
    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        {
          model: 'google/gemini-pro',
          contents: [{ parts: [{ text: message }] }],
        },
        {
          headers: {
            'x-goog-api-key': process.env.GEMINI_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      res.status(200).json({ reply: response.data.candidates[0].content.parts[0].text });
    } catch (err) {
      console.log(err.response?.data || err.message);
      res.status(500).json({ error: 'Gemini API error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
