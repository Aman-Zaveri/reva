/**
 * API Route: /api/hub/experiences
 * Handles CRUD operations for user's experience data.
 *
 * GET: Returns all experiences for the authenticated user.
 * POST: Validates and creates a new experience for the authenticated user.
 * PUT: Updates one or more experiences for the authenticated user.
 * DELETE: Deletes an experience for the authenticated user.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { experienceSchema, updateExperienceSchema, validateRequest } from '@/lib/validation'

/**
 * GET handler for experiences.
 * Returns all experiences for the authenticated user.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch experiences from database
    const experiences = await prisma.experience.findMany({
      where: { userId: session.user.id },
      include: { bullets: { orderBy: { order: 'asc' } } },
      orderBy: { startDate: 'desc' }
    })

    return NextResponse.json(experiences)
  } catch (error) {
    // Log and return error response
    console.error('Error fetching experiences:', error)
    return NextResponse.json({ error: 'Failed to fetch experiences' }, { status: 500 })
  }
}

/**
 * POST handler for experiences.
 * Validates and creates a new experience for the authenticated user.
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
    const validation = validateRequest(experienceSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const data = validation.data

    // Create new experience in database
    const experience = await prisma.experience.create({
      data: {
        userId: session.user.id,
        company: data.company,
        title: data.title,
        location: data.location,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        bullets: {
          create: data.bullets?.map((bullet: string, index: number) => ({
            content: bullet,
            order: index
          })) || []
        }
      },
      include: { bullets: { orderBy: { order: 'asc' } } }
    })

    return NextResponse.json(experience)
  } catch (error) {
    // Log and return error response
    console.error('Error creating experience:', error)
    return NextResponse.json({ error: 'Failed to create experience' }, { status: 500 })
  }
}

/**
 * PUT handler for experiences.
 * Updates one or more experiences for the authenticated user.
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

    // Handle both single experience update and batch update
    if (Array.isArray(body)) {
      // Batch update - replace all experiences

      // First, delete all existing experiences for this user
      await prisma.experience.deleteMany({
        where: { userId: session.user.id }
      })

      // Then create all new ones
      const experiences = []
      for (const expData of body) {
        if (expData.id && expData.id.startsWith('temp-')) {
          // Skip temp IDs, create new records
          delete expData.id
        }

        // Create new experience
        const experience = await prisma.experience.create({
          data: {
            userId: session.user.id,
            company: expData.company || '',
            title: expData.title || '',
            location: expData.location || '',
            startDate: expData.startDate ? new Date(expData.startDate) : null,
            endDate: expData.endDate ? new Date(expData.endDate) : null,
            bullets: {
              create: expData.bullets?.map((bullet: string, index: number) => ({
                content: bullet,
                order: index
              })) || []
            }
          },
          include: { bullets: { orderBy: { order: 'asc' } } }
        })
        experiences.push(experience)
      }

      return NextResponse.json(experiences)
    } else {
      // Single experience update
      const validation = validateRequest(updateExperienceSchema, body)
      if (!validation.success) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }

      const { id, bullets, ...data } = validation.data

      // Update experience in database
      const experience = await prisma.experience.update({
        where: { 
          id,
          userId: session.user.id
        },
        data: {
          company: data.company,
          title: data.title,
          location: data.location,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          bullets: {
            deleteMany: {},
            create: bullets?.map((bullet: string, index: number) => ({
              content: bullet,
              order: index
            })) || []
          }
        },
        include: { bullets: { orderBy: { order: 'asc' } } }
      })

      return NextResponse.json(experience)
    }
  } catch (error) {
    // Log and return error response
    console.error('Error updating experience:', error)
    return NextResponse.json({ error: 'Failed to update experience' }, { status: 500 })
  }
}

/**
 * DELETE handler for experiences.
 * Deletes an experience for the authenticated user by ID.
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get experience ID from query params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Experience ID required' }, { status: 400 })
    }

    // Delete experience from database
    await prisma.experience.delete({
      where: { 
        id,
        userId: session.user.id // Ensure user owns this experience
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    // Log and return error response
    console.error('Error deleting experience:', error)
    return NextResponse.json({ error: 'Failed to delete experience' }, { status: 500 })
  }
}