// supabase/functions/divination/index.ts
// Deno runtime — no npm, no node. Runs on Supabase Edge.
// POST /functions/v1/divination
//   Body: { question, guardian_key, hexagram_index, lines, mansion_index, ganzhi, fortune_zh, fortune_en }
//   Returns: DivinationLog row

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ─── Compute SHA-256 verified hash (same algo as client verify) ──────────────
async function computeHash(createdAt: string, question: string, lines: number[]): Promise<string> {
  const data = `${createdAt}|${question}|${lines.join(',')}`
  const encoded = new TextEncoder().encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32)
}

serve(async (req: Request) => {
  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS })
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await req.json() as {
      question: string
      guardian_key: string
      hexagram_index: number
      lines: number[]
      mansion_index: number
      ganzhi: string
      fortune_zh: string
      fortune_en: string
    }

    // Validate
    if (!body.question || body.question.trim().length < 2) {
      throw new Error('question must be at least 2 characters')
    }
    if (!Array.isArray(body.lines) || body.lines.length !== 6) {
      throw new Error('lines must be an array of 6 values')
    }
    const validKeys = ['azure', 'vermilion', 'white', 'black']
    if (!validKeys.includes(body.guardian_key)) {
      throw new Error('invalid guardian_key')
    }

    // Use service-role client to bypass RLS for insert
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE)

    // Insert without verified_hash first to get the DB-assigned created_at
    const { data: inserted, error: insertErr } = await supabase
      .from('divination_logs')
      .insert({
        question:       body.question.trim(),
        guardian_key:   body.guardian_key,
        hexagram_index: body.hexagram_index,
        lines:          body.lines,
        mansion_index:  body.mansion_index,
        ganzhi:         body.ganzhi,
        fortune_zh:     body.fortune_zh,
        fortune_en:     body.fortune_en,
        verified_hash:  'pending',
      })
      .select('*')
      .single()

    if (insertErr || !inserted) {
      throw new Error(insertErr?.message ?? 'Insert failed')
    }

    // Compute hash using the real DB created_at
    const hash = await computeHash(inserted.created_at, inserted.question, inserted.lines)

    // Update with the real hash
    const { data: sealed, error: updateErr } = await supabase
      .from('divination_logs')
      .update({ verified_hash: hash })
      .eq('id', inserted.id)
      .select('*')
      .single()

    if (updateErr || !sealed) {
      throw new Error(updateErr?.message ?? 'Hash update failed')
    }

    return new Response(JSON.stringify(sealed), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
