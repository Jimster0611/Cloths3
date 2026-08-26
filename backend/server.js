import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getLLMReply } from './ai/llmService.js';
import { searchImages } from './ai/imageSearchService.js';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const { reply, searchQuery } = await getLLMReply(message);
    const images = await searchImages(searchQuery);
    res.json({ reply, searchQuery, images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chat failed' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Backend running on http://localhost:${process.env.PORT}`);
});