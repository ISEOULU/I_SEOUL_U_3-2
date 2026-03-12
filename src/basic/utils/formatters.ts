/**
 * 순수 함수: 숫자 → 통화 표시 문자열만 변환
 * (품절 여부, 관리자/일반 분기는 호출하는 쪽에서 처리)
 */
export function formatPriceDisplay(price: number, style: 'user' | 'admin'): string {
  const formatted = price.toLocaleString();
  if (style === 'admin') {
    return `${formatted}원`;
  }
  return `₩${formatted}`;
}
