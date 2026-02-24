import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const { lines, question, language } = await req.json()
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');

    if (!DEEPSEEK_API_KEY) throw new Error("API Key missing on server")

    // 确定目标语言
    const targetLanguage = language === 'en' ? 'English' : 'Chinese'
    const hexagramStr = lines.join(', ')

    // ==========================================
    // STEP 1: 获取客观数据（卦名、中文诗词）
    // ==========================================
    const metaResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are an I Ching database. You must return ONLY a JSON object with exact keys: { "hexagramNameZh": "string", "hexagramNameEn": "string", "poemZh": "string" }. The "poemZh" must be a classic Chinese poem/phrase representing the hexagram.`
          },
          {
            role: 'user',
            content: `Identify the hexagram for these lines (bottom to top, 0=Y
