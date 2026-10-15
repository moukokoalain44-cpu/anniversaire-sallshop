import { GoogleGenAI } from '@google/genai'
import { writeFile } from 'node:fs/promises'
const ai = new GoogleGenAI({
  apiKey: process.env.NETLIFY_AI_GATEWAY_KEY,
  httpOptions: {
    baseUrl: process.env.NETLIFY_AI_GATEWAY_URL?.replace(/\/$/, ''),
  },
})
try {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image',
    contents:
      'Create a cinematic luxury fashion campaign photograph, wide horizontal 16:9. Two stylish young adult Senegalese Black models, a woman in a striking black tailored evening outfit with gold jewellery and a man in a black elegant streetwear suit, at an intimate high-end Dakar fashion boutique anniversary party. Woman foreground right, man behind slightly left. Warm amber spotlights, distant soft golden bokeh, dramatic shadows, dark warm charcoal background, film grain, photographed with flash, editorial Vogue aesthetic, rich textures, sophisticated celebration. Composition: models on RIGHT two thirds, LEFT third nearly black empty negative space for text overlay. No text, no logos, no watermarks.',
    config: { responseModalities: ['IMAGE'] },
  })
  for (const part of response.candidates?.[0]?.content?.parts ?? [])
    if (part.inlineData) {
      await writeFile(
        'public/img/sall-campaign.png',
        Buffer.from(part.inlineData.data, 'base64'),
      )
      console.log('Campaign image saved.')
    }
} catch {
  console.log('Image generation unavailable.')
}
