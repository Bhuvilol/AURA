import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'GET') {
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
      res.status(200).json({ quote: response.data.choices[0].message.content.trim() });
    } catch (err) {
      console.log(err.response?.data || err.message);
      res.status(500).json({ error: 'OpenRouter API error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 