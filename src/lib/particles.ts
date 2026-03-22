// 한국어 조사 자동 선택 유틸리티
// 마지막 글자의 받침(종성) 유무에 따라 올바른 조사를 반환

function hasFinalConsonant(str: string): boolean {
  if (!str) return false
  const lastChar = str[str.length - 1]
  const code = lastChar.charCodeAt(0)

  // 한글 범위 (가 ~ 힣)
  if (code < 0xAC00 || code > 0xD7A3) {
    // 한글이 아닌 경우: 숫자나 영문 등
    // 숫자: 0,1,3,6,7,8 은 받침 있음 취급
    if (/[0136789]$/.test(str)) return true
    // 영문: l,m,n,r 등은 받침 있음 취급
    if (/[lmnr]$/i.test(str)) return true
    return false
  }

  // 한글 유니코드: (code - 0xAC00) % 28 === 0 이면 받침 없음
  return (code - 0xAC00) % 28 !== 0
}

// 을/를
export function eulReul(word: string): string {
  return hasFinalConsonant(word) ? '을' : '를'
}

// 은/는
export function eunNeun(word: string): string {
  return hasFinalConsonant(word) ? '은' : '는'
}

// 이/가
export function iGa(word: string): string {
  return hasFinalConsonant(word) ? '이' : '가'
}

// 과/와
export function gwaWa(word: string): string {
  return hasFinalConsonant(word) ? '과' : '와'
}

// 으로/로
export function euroRo(word: string): string {
  if (!word) return '로'
  const lastChar = word[word.length - 1]
  const code = lastChar.charCodeAt(0)
  if (code < 0xAC00 || code > 0xD7A3) return '로'
  const jongseong = (code - 0xAC00) % 28
  // 받침 없거나 ㄹ받침(8)이면 '로', 그 외 '으로'
  return jongseong === 0 || jongseong === 8 ? '로' : '으로'
}
