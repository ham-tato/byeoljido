/* eslint-disable @typescript-eslint/no-explicit-any */

const KAKAO_JS_KEY = '3f31a86960a09410082a4290b863ccb1'

declare global {
  interface Window {
    Kakao: any
  }
}

export interface KakaoUser {
  id: number
  nickname: string
  profileImage?: string
}

export function initKakao() {
  if (window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(KAKAO_JS_KEY)
  }
}

export function kakaoLogin(): Promise<KakaoUser> {
  return new Promise((resolve, reject) => {
    window.Kakao.Auth.login({
      success: () => {
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: (res: any) => {
            resolve({
              id: res.id,
              nickname: res.kakao_account?.profile?.nickname ?? '별지도 사용자',
              profileImage: res.kakao_account?.profile?.thumbnail_image_url,
            })
          },
          fail: reject,
        })
      },
      fail: reject,
    })
  })
}

export function kakaoLogout(): Promise<void> {
  return new Promise((resolve) => {
    window.Kakao.Auth.logout(() => resolve())
  })
}

export function isKakaoLoggedIn(): boolean {
  return !!(window.Kakao?.Auth?.getAccessToken())
}
