import { createDeepSeek } from '@ai-sdk/deepseek';
import { generateText } from 'ai';

export const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY ?? '',
});

export const { text } = await generateText({
    model: deepseek('deepseek-chat'),
    prompt: 'Write a vegetarian lasagna recipe for 4 people.',
  });
  