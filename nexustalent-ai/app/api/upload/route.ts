import { NextRequest, NextResponse } from 'next/server'
import {
  createSupabaseServerClient,
  createSupabaseAdminClient,
} from '@/lib/supabase-server'
import { getUserSubscription, checkCVQuota } from '@/lib/quota'

// ── Mock AI parsing — simulates extraction delay and returns fake data ───────
function generateMockParsedData(fileName: string) {
  const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Quinn', 'Avery', 'Drew']
  const lastNames = ['Chen', 'Patel', 'Williams', 'Garcia', 'Kim', 'Brown', 'Singh', 'Johnson', 'Lee', 'Davis']
  const skills = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python',
    'SQL', 'AWS', 'Docker', 'Git', 'REST APIs', 'GraphQL', 'Tailwind CSS',
    'PostgreSQL', 'MongoDB', 'CI/CD', 'Agile', 'Figma', 'Testing', 'Linux',
  ]

  const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
  const emailName = name.toLowerCase().replace(' ', '.')
  const shuffledSkills = skills.sort(() => 0.5 - Math.random()).slice(0, 5 + Math.floor(Math.random() * 6))

  return {
    candidateName: name,
    candidateEmail: `${emailName}@email.com`,
    parsedData: {
      skills: shuffledSkills,
      experience: [
        {
          company: 'TechCorp Inc.',
          title: 'Senior Software Engineer',
          duration: '2022 – Present',
          description: 'Led development of microservices architecture serving 100K+ users. Mentored junior developers and conducted code reviews.',
        },
        {
          company: 'StartupXYZ',
          title: 'Full Stack Developer',
          duration: '2020 – 2022',
          description: 'Built and maintained React-based dashboard and Node.js REST APIs. Implemented CI/CD pipeline reducing deployment time by 60%.',
        },
        {
          company: 'Digital Agency Co.',
          title: 'Junior Developer',
          duration: '2018 – 2020',
          description: 'Developed responsive web applications using modern JavaScript frameworks. Collaborated with design team on UI/UX improvements.',
        },
      ],
      education: [
        {
          institution: 'State University',
          degree: 'B.Sc. Computer Science',
          year: '2018',
        },
      ],
      summary: `Experienced software engineer with ${2 + Math.floor(Math.random() * 6)}+ years of expertise in full-stack web development. Passionate about building scalable, user-friendly applications with modern technologies.`,
    },
    atsScore: 45 + Math.floor(Math.random() * 50), // 45-94
    matchScore: 30 + Math.floor(Math.random() * 60), // 30-89
    suggestions: [
      {
        category: 'keywords' as const,
        priority: 'high' as const,
        text: 'Add more industry-specific keywords related to the target role. ATS systems scan for exact keyword matches from the job description.',
      },
      {
        category: 'impact' as const,
        priority: 'high' as const,
        text: 'Quantify your achievements with numbers — e.g., "Increased revenue by 25%" instead of "Improved revenue". Metrics make your impact tangible.',
      },
      {
        category: 'formatting' as const,
        priority: 'medium' as const,
        text: 'Use a clean, single-column layout with standard section headings (Experience, Education, Skills). Avoid tables, images, or multi-column layouts.',
      },
      {
        category: 'content' as const,
        priority: 'medium' as const,
        text: 'Add a professional summary at the top of your CV that highlights your key strengths and career objectives in 2-3 sentences.',
      },
      {
        category: 'keywords' as const,
        priority: 'low' as const,
        text: 'Consider adding certifications or relevant coursework to strengthen your profile for automated screening systems.',
      },
    ],
  }
}

export async function POST(request: NextRequest) {
  try {
    // ── Auth check ─────────────────────────────────────────────────────────
    const serverClient = await createSupabaseServerClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    // ── Parse multipart form data ──────────────────────────────────────────
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const jobId = formData.get('jobId') as string | null // null for B2C, UUID for B2B

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are accepted.' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be under 5MB.' }, { status: 400 })
    }

    // ── B2B quota check (only for job-linked uploads) ──────────────────────
    if (jobId) {
      const subscription = await getUserSubscription(user.id)
      if (!subscription) {
        return NextResponse.json(
          { error: 'No subscription found.' },
          { status: 403 }
        )
      }

      const quotaCheck = await checkCVQuota(user.id, jobId, subscription)
      if (!quotaCheck.allowed) {
        return NextResponse.json(
          { error: quotaCheck.message },
          { status: quotaCheck.status }
        )
      }
    }

    // ── Upload to Supabase Storage ─────────────────────────────────────────
    const adminClient = createSupabaseAdminClient()
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `${user.id}/${timestamp}_${safeName}`

    const fileBuffer = await file.arrayBuffer()

    const { error: uploadError } = await adminClient.storage
      .from('resumes')
      .upload(storagePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file. Please try again.' },
        { status: 500 }
      )
    }

    // ── Mock AI processing (simulates parse + score delay) ─────────────────
    await new Promise((resolve) => setTimeout(resolve, 800))
    const mockData = generateMockParsedData(file.name)

    // ── Insert resume record ───────────────────────────────────────────────
    const resumeRecord = {
      owner_id: user.id,
      job_id: jobId || null,
      storage_path: storagePath,
      candidate_name: mockData.candidateName,
      candidate_email: mockData.candidateEmail,
      ats_score: mockData.atsScore,
      match_score: jobId ? mockData.matchScore : null,
      ai_suggestions: mockData.suggestions,
      parsed_data: mockData.parsedData,
      draft_content: mockData.parsedData, // initial draft = parsed data
      status: 'scored' as const,
    }

    const { data: resume, error: insertError } = await adminClient
      .from('resumes')
      .insert(resumeRecord)
      .select()
      .single()

    if (insertError) {
      console.error('Resume insert error:', insertError)
      // Clean up uploaded file on DB failure
      await adminClient.storage.from('resumes').remove([storagePath])
      return NextResponse.json(
        { error: 'Failed to save resume record.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, resume }, { status: 201 })
  } catch (err) {
    console.error('Upload route error:', err)
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    )
  }
}
