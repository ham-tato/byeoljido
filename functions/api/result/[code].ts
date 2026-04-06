import type { FullReading } from '../../shared/reading'

interface Env {
  SUPABASE_URL: string
  SUPABASE_SERVICE_KEY: string
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const code = context.params.code as string
  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = context.env

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/results?id=eq.${code}&select=input,reading,paid`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    },
  )

  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'DB 조회 실패' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const rows = await res.json() as Array<{ input: unknown; reading: FullReading; paid: boolean }>
  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: '결과를 찾을 수 없습니다' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const row = rows[0]

  return new Response(JSON.stringify({ paid: row.paid, input: row.input, reading: row.reading }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
