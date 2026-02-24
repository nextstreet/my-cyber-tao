import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { HEXAGRAM_DATA } from "./data.ts" 

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { lines, question } = await req.json()
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')
    const code = lines.join('')
    const baseData = HEXAGRAM_DATA[code] || HEXAGRAM_DATA["111111"]

    // --- STAGE 1: 语种识别 (Language Detection) ---
    const langDetection = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ 
          role: 'system', 
          content: 'Identify the language of the user question. Return ONLY the language name in English (e.g., "Chinese", "English", "French", "Japanese").' 
        }, { 
          role: 'user', content: question 
        }]
      })
    })
    const langData = await langDetection.json()
    const detectedLang = langData.choices[0].message.content.trim()

    // --- STAGE 2: 深度解读 (Interpretation with Translation) ---
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are the "Cyber Sage". 
            PROCESS: 
            1. Internalize the I-Ching wisdom in Chinese. 
            2. Translate the final insight into ${detectedLang}.
            RULES:
            - Final output MUST be 100% in ${detectedLang}.
            - Tone: Mystical, Cyberpunk, Philosophical.
            - Format: JSON {"interpretation": "..."}`
          },
          {
            role: 'user',
            content: `Hexagram: ${baseData.nameEn} (${baseData.nameZh})\nPoem: ${baseData.poemZh}\nUser Question: ${question}\n\nProvide the interpretation in ${detectedLang}:`
          }
        ],
        response_format: { type: "json_object" }
      })
    })

    const aiData = await response.json()
    return new Response(JSON.stringify({
      ...JSON.parse(aiData.choices[0].message.content),
      detectedLang
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: corsHeaders })
  }
})
