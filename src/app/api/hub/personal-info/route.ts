/**
 * API Route: /api/hub/personal-info
 * Handles GET and POST requests for user's personal information.
 *
 * GET: Returns the personal info for the authenticated user.
 * POST: Validates and upserts personal info for the authenticated user.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { personalInfoSchema, validateRequest } from '@/lib/validation'

/**
 * GET handler for personal info.
 * Returns the personal info for the authenticated user.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch personal info from database
    const personalInfo = await prisma.personalInfo.findUnique({
      where: { userId: session.user.id }
    })

    return NextResponse.json(personalInfo)
  } catch (error) {
    // Log and return error response
    console.error('Error fetching personal info:', error)
    return NextResponse.json({ error: 'Failed to fetch personal info' }, { status: 500 })
  }
}

/**
 * POST handler for personal info.
 * Validates and upserts personal info for the authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()

    // Validate input data
    const validation = validateRequest(personalInfoSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const data = validation.data

    // Upsert personal info in database
    const personalInfo = await prisma.personalInfo.upsert({
      where: { userId: session.user.id },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        linkedin: data.linkedin,
        github: data.github,
        summary: data.summary,
      },
      create: {
        userId: session.user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        linkedin: data.linkedin,
        github: data.github,
        summary: data.summary,
      }
    })

    return NextResponse.json(personalInfo)
  } catch (error) {
    // Log and return error response
    console.error('Error saving personal info:', error)
    return NextResponse.json({ error: 'Failed to save personal info' }, { status: 500 })
  }
}