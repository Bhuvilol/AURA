import pdfParse from 'pdf-parse';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const buffer = Buffer.concat(buffers);

    try {
      const data = await pdfParse(buffer);
      res.status(200).json({ text: data.text });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'PDF parsing error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 