import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const payload = await req.json()
    console.log("Received Payload:", payload) // 这行会在 Supabase Logs 出现

    const { lines, question } = payload

    if (!lines || lines.length !== 6) throw new Error("Missing lines")

    // 模拟测试返回，先不调 AI，看看能否成功返回
    return new Response(
      JSON.stringify({
        hexagramNameZh: "乾为天",
        hexagramNameEn: "THE CREATIVE",
        poemZh: "天行健，君子以自强不息。",
        interpretation: "Test successful.",
        guardian: "dragon"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (e) {
    console.error("Internal Error:", e.message)
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
