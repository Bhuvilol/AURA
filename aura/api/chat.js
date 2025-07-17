import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { message } = req.body;
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'mistralai/mistral-7b-instruct:free',
          messages: [{ role: 'user', content: message }],
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      res.status(200).json({ reply: response.data.choices[0].message.content });
    } catch (err) {
      console.log(err.response?.data || err.message);
      res.status(500).json({ error: 'OpenRouter API error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 