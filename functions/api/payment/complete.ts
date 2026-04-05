interface Env {
  SUPABASE_URL: string
  SUPABASE_SERVICE_KEY: string
  PORTONE_API_SECRET: string
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { code, paymentId } = await context.request.json() as { code: string; paymentId: string }

  if (!code || !paymentId) {
    return new Response(JSON.stringify({ error: '필수 파라미터 누락' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY, PORTONE_API_SECRET } = context.env

  // 1. PortOne API로 결제 검증
  const portoneRes = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
    headers: { 'Authorization': `PortOne ${PORTONE_API_SECRET}` },
  })

  if (!portoneRes.ok) {
    return new Response(JSON.stringify({ error: 'PortOne 결제 조회 실패' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const payment = await portoneRes.json() as { status: string; amount: { total: number } }

  // 2. 결제 상태 및 금액 검증
  if (payment.status !== 'PAID') {
    return new Response(JSON.stringify({ error: '결제가 완료되지 않았습니다' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (payment.amount.total !== 1900) {
    return new Response(JSON.stringify({ error: '결제 금액이 일치하지 않습니다' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 3. Supabase 업데이트
  const updateRes = await fetch(
    `${SUPABASE_URL}/rest/v1/results?id=eq.${code}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ paid: true, payment_id: paymentId }),
    },
  )

  if (!updateRes.ok) {
    return new Response(JSON.stringify({ error: 'DB 업데이트 실패' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
