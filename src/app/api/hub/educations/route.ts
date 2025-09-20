/**
 * API Route: /api/hub/educations
 * Handles CRUD operations for user's education data.
 *
 * GET: Returns all educations for the authenticated user.
 * POST: Creates a new education record for the authenticated user.
 * PUT: Updates one or more education records for the authenticated user.
 * DELETE: Deletes an education record for the authenticated user.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET handler for educations.
 * Returns all educations for the authenticated user.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch educations from database
    const educations = await prisma.education.findMany({
      where: { userId: session.user.id },
      orderBy: { graduationDate: 'desc' }
    })

    return NextResponse.json(educations)
  } catch (error) {
    // Log and return error response
    console.error('Error fetching educations:', error)
    return NextResponse.json({ error: 'Failed to fetch educations' }, { status: 500 })
  }
}

/**
 * POST handler for educations.
 * Creates a new education record for the authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const data = await request.json()

    // Create new education in database
    const education = await prisma.education.create({
      data: {
        userId: session.user.id,
        institution: data.institution,
        degree: data.program,
        minor: data.minor,
        graduationDate: data.graduationDate ? new Date(data.graduationDate) : null,
        gpa: data.gpa,
        relevantCoursework: data.relevantCoursework,
      }
    })

    return NextResponse.json(education)
  } catch (error) {
    // Log and return error response
    console.error('Error creating education:', error)
    return NextResponse.json({ error: 'Failed to create education' }, { status: 500 })
  }
}

/**
 * PUT handler for educations.
 * Updates one or more education records for the authenticated user.
 * Supports batch update (replace all) and single update.
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()

    // Handle both single education update and batch update
    if (Array.isArray(body)) {
      // Batch update - replace all educations

      // First, delete all existing educations for this user
      await prisma.education.deleteMany({
        where: { userId: session.user.id }
      })

      // Then create all new ones
      const educations = []
      for (const eduData of body) {
        if (eduData.id && eduData.id.startsWith('temp-')) {
          // Skip temp IDs, create new records
          delete eduData.id
        }

        // Create new education
        const education = await prisma.education.create({
          data: {
            userId: session.user.id,
            institution: eduData.institution || '',
            degree: eduData.degree || eduData.program || '',
            minor: eduData.minor || '',
            graduationDate: eduData.graduationDate ? new Date(eduData.graduationDate) : null,
            gpa: eduData.gpa || '',
            relevantCoursework: eduData.relevantCoursework || '',
          }
        })
        educations.push(education)
      }

      return NextResponse.json(educations)
    } else {
      // Single education update
      const { id, ...data } = body

      // Update education in database
      const education = await prisma.education.update({
        where: { 
          id,
          userId: session.user.id
        },
        data: {
          institution: data.institution,
          degree: data.program,
          minor: data.minor,
          graduationDate: data.graduationDate ? new Date(data.graduationDate) : null,
          gpa: data.gpa,
          relevantCoursework: data.relevantCoursework,
        }
      })

      return NextResponse.json(education)
    }
  } catch (error) {
    // Log and return error response
    console.error('Error updating education:', error)
    return NextResponse.json({ error: 'Failed to update education' }, { status: 500 })
  }
}

/**
 * DELETE handler for educations.
 * Deletes an education record for the authenticated user by ID.
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get education ID from query params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Education ID required' }, { status: 400 })
    }

    // Delete education from database
    await prisma.education.delete({
      where: { 
        id,
        userId: session.user.id // Ensure user owns this education
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    // Log and return error response
    console.error('Error deleting education:', error)
    return NextResponse.json({ error: 'Failed to delete education' }, { status: 500 })
  }
}