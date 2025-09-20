import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      include: { 
        bullets: { orderBy: { order: 'asc' } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
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
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      // Single project update (existing logic)
      const { id, bullets, ...data } = body
      
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
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    await prisma.project.delete({
      where: { 
        id,
        userId: session.user.id // Ensure user owns this project
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}