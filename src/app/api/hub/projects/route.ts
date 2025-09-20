/**
 * API Route: /api/hub/projects
 * Handles CRUD operations for user's project data.
 *
 * GET: Returns all projects for the authenticated user.
 * POST: Creates a new project for the authenticated user.
 * PUT: Updates one or more projects for the authenticated user.
 * DELETE: Deletes a project for the authenticated user.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET handler for projects.
 * Returns all projects for the authenticated user.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch projects from database
    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      include: { 
        bullets: { orderBy: { order: 'asc' } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(projects)
  } catch (error) {
    // Log and return error response
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

/**
 * POST handler for projects.
 * Creates a new project for the authenticated user.
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

    // Create new project in database
    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        title: data.title,
        link: data.link,
        date: data.date ? new Date(data.date) : null,
        bullets: {
          create: data.bullets?.map((bullet: string, index: number) => ({
            content: bullet,
            order: index
          })) || []
        }
      },
      include: { 
        bullets: { orderBy: { order: 'asc' } }
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    // Log and return error response
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}

/**
 * PUT handler for projects.
 * Updates one or more projects for the authenticated user.
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

    // Handle both single project update and batch update
    if (Array.isArray(body)) {
      // Batch update - replace all projects

      // First, delete all existing projects for this user
      await prisma.project.deleteMany({
        where: { userId: session.user.id }
      })

      // Then create all new ones
      const projects = []
      for (const projData of body) {
        if (projData.id && projData.id.startsWith('temp-')) {
          // Skip temp IDs, create new records
          delete projData.id
        }

        // Create new project
        const project = await prisma.project.create({
          data: {
            userId: session.user.id,
            title: projData.title || '',
            link: projData.link || '',
            date: projData.date ? new Date(projData.date) : null,
            bullets: {
              create: projData.bullets?.map((bullet: string, index: number) => ({
                content: bullet,
                order: index
              })) || []
            }
          },
          include: { 
            bullets: { orderBy: { order: 'asc' } }
          }
        })
        projects.push(project)
      }

      return NextResponse.json(projects)
    } else {
      // Single project update
      const { id, bullets, ...data } = body

      // Update project in database
      const project = await prisma.project.update({
        where: { 
          id,
          userId: session.user.id
        },
        data: {
          title: data.title,
          link: data.link,
          date: data.date ? new Date(data.date) : null,
          bullets: {
            deleteMany: {},
            create: bullets?.map((bullet: string, index: number) => ({
              content: bullet,
              order: index
            })) || []
          }
        },
        include: { 
          bullets: { orderBy: { order: 'asc' } }
        }
      })

      return NextResponse.json(project)
    }
  } catch (error) {
    // Log and return error response
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

/**
 * DELETE handler for projects.
 * Deletes a project for the authenticated user by ID.
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get project ID from query params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    // Delete project from database
    await prisma.project.delete({
      where: { 
        id,
        userId: session.user.id // Ensure user owns this project
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    // Log and return error response
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}