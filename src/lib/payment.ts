import * as PortOne from '@portone/browser-sdk/v2'
import type { PayMethod } from '@/components/PaywallOverlay'

const STORE_ID = import.meta.env.VITE_PORTONE_STORE_ID || ''
const CHANNEL_KEY_KAKAOPAY = import.meta.env.VITE_PORTONE_CHANNEL_KAKAOPAY || ''
const CHANNEL_KEY_TOSSPAY = import.meta.env.VITE_PORTONE_CHANNEL_TOSSPAY || ''

export async function requestPayment(code: string, method: PayMethod): Promise<string | null> {
  const paymentId = `byeoljido-${code}-${Date.now()}`
  const channelKey = method === 'kakaopay' ? CHANNEL_KEY_KAKAOPAY : CHANNEL_KEY_TOSSPAY

  const response = await PortOne.requestPayment({
    storeId: STORE_ID,
    channelKey,
    paymentId,
    orderName: '별지도 전체 리포트',
    totalAmount: 1900,
    currency: 'CURRENCY_KRW',
    payMethod: 'EASY_PAY',
  })

  if (!response || response.code) {
    return null
  }

  return response.paymentId
}
