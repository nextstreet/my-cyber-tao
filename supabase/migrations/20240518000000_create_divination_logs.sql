-- Create divination_logs table for storing sealed divination records
CREATE TABLE IF NOT EXISTS public.divination_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  question        TEXT NOT NULL,
  guardian_key    TEXT NOT NULL CHECK (guardian_key IN ('azure', 'vermilion', 'white', 'black')),
  hexagram_index  INTEGER NOT NULL,
  lines           INTEGER[] NOT NULL,
  mansion_index   INTEGER NOT NULL,
  ganzhi          TEXT NOT NULL,
  fortune_zh      TEXT NOT NULL,
  fortune_en      TEXT NOT NULL,

  verified_hash   TEXT NOT NULL DEFAULT 'pending'
);

ALTER TABLE public.divination_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.divination_logs
  FOR SELECT USING (true);

CREATE POLICY "Allow service insert" ON public.divination_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service update" ON public.divination_logs
  FOR UPDATE USING (true);
