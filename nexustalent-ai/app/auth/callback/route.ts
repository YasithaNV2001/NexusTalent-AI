import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const role = requestUrl.searchParams.get('role') // 'hr_manager' | 'jobseeker' | null
  const redirectTo = requestUrl.searchParams.get('redirectTo') || ''
  const origin = requestUrl.origin

  // Handle missing auth code → redirect to login with error
  if (!code) {
    const loginUrl = new URL('/auth/login', origin)
    loginUrl.searchParams.set('error', 'missing_code')
    return NextResponse.redirect(loginUrl)
  }

  // We'll collect cookies set by Supabase during code exchange so we can
  // copy them onto the final redirect response.
  const cookiesToForward: { name: string; value: string; options: Record<string, unknown> }[] = []

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
          // Store cookies so we can forward them to the redirect response
          cookiesToForward.push(
            ...cookiesToSet.map(({ name, value, options }) => ({
              name,
              value,
              options: options as Record<string, unknown>,
            }))
          )
        },
      },
    }
  )

  // Exchange the auth code for a session
  const { data: sessionData, error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError || !sessionData?.user) {
    const loginUrl = new URL('/auth/login', origin)
    loginUrl.searchParams.set('error', 'auth_failed')
    return NextResponse.redirect(loginUrl)
  }

  const user = sessionData.user

  // ── Role Assignment ──────────────────────────────────────────────────────
  if (role === 'hr_manager') {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    )

    await adminClient
      .from('profiles')
      .update({ role: 'hr_manager' })
      .eq('id', user.id)
  }

  // ── Determine Redirect Destination ───────────────────────────────────────
  let destinationPath: string

  if (redirectTo && redirectTo.startsWith('/')) {
    destinationPath = redirectTo
  } else {
    // Fetch the user's actual role (may have just been updated above)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role || 'jobseeker'
    destinationPath =
      userRole === 'admin'
        ? '/dashboard/admin'
        : userRole === 'hr_manager'
        ? '/dashboard/hr'
        : '/dashboard/user'
  }

  // ── Build redirect response WITH auth cookies ────────────────────────────
  const redirectResponse = NextResponse.redirect(
    new URL(destinationPath, origin)
  )

  // Forward all session cookies from the code exchange onto the redirect
  cookiesToForward.forEach(({ name, value, options }) => {
    redirectResponse.cookies.set(name, value, options)
  })

  return redirectResponse
}
