import type { PayMethod } from '@/components/PaywallOverlay'

/**
 * 결제 요청 — Task 5에서 실제 구현 예정
 * 현재는 placeholder로 빌드 통과용
 */
export async function requestPayment(
  _code: string,
  _method: PayMethod,
): Promise<string | null> {
  throw new Error('결제 모듈이 아직 구현되지 않았습니다.')
}
