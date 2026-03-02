import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Protect all /dashboard/* routes ──────────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/auth/login'
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Fetch profile to get role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    // Role-based route protection
    if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/user', request.url))
    }

    if (pathname.startsWith('/dashboard/hr') && role !== 'hr_manager' && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/user', request.url))
    }

    if (pathname.startsWith('/dashboard/user') && role === 'hr_manager') {
      return NextResponse.redirect(new URL('/dashboard/hr', request.url))
    }

    if (pathname.startsWith('/dashboard/user') && role === 'admin') {
      return NextResponse.redirect(new URL('/dashboard/admin', request.url))
    }
  }

  // ── Redirect authenticated users away from login ──────────────────────────
  if (pathname.startsWith('/auth/login') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role
    const dest =
      role === 'admin'
        ? '/dashboard/admin'
        : role === 'hr_manager'
        ? '/dashboard/hr'
        : '/dashboard/user'

    return NextResponse.redirect(new URL(dest, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}