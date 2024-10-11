import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

//supabase.auth.getUser를 통해 토큰 리프레시
//갱신된 토큰을 request.cookies.set을 통해 서버 컴포넌트에 전달 - 서버에서 토큰 리프레시를 시도하지 않음
//갱신된 토큰을 response.cookies.set을 통해 브라우저로 전달 - 브라우저가 이전에 사용하던 토큰을 새 토큰으로 교체

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // refreshing the auth token
  await supabase.auth.getUser()

  return supabaseResponse
}
