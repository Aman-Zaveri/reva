import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { skillSchema, updateSkillSchema, validateRequest } from '@/lib/validation'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const skills = await prisma.skill.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { category: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    // Group skills by category for the frontend
    const groupedSkills = skills.reduce((acc: any, skill) => {
      const category = skill.category || 'Uncategorized'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(skill)
      return acc
    }, {})

    return NextResponse.json(groupedSkills)
  } catch (error) {
    console.error('Error fetching skills:', error)
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Handle bulk creation of skills for a category
    if (body.skills && Array.isArray(body.skills)) {
      // Validate bulk skills creation
      const skillsData = body.skills.map((skillName: string) => ({
        name: skillName,
        category: body.category
      }));
      
      // Validate each skill
      for (const skillData of skillsData) {
        const validation = validateRequest(skillSchema, skillData);
        if (!validation.success) {
          return NextResponse.json({ error: validation.error }, { status: 400 });
        }
      }
      
      const skills = await Promise.all(
        skillsData.map((skillData: { name: string; category: string }) =>
          prisma.skill.create({
            data: {
              userId: session.user.id,
              name: skillData.name,
              category: skillData.category,
            }
          })
        )
      )
      return NextResponse.json(skills)
    }
    
    // Handle single skill creation
    const validation = validateRequest(skillSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    
    const data = validation.data
    
    const skill = await prisma.skill.create({
      data: {
        userId: session.user.id,
        name: data.name,
        category: data.category,
      }
    })

    return NextResponse.json(skill)
  } catch (error) {
    console.error('Error creating skill:', error)
    return NextResponse.json({ error: 'Failed to create skill' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Handle batch skills update (replace all skills with new data)
    if (typeof body === 'object' && !body.id) {
      // Body is grouped skills object like { "Frontend": [...], "Backend": [...] }
      
      // First, delete all existing skills for this user
      await prisma.skill.deleteMany({
        where: { userId: session.user.id }
      })
      
      // Then create all new skills
      const allSkills = []
      for (const [categoryName, skills] of Object.entries(body)) {
        for (const skill of skills as any[]) {
          const newSkill = await prisma.skill.create({
            data: {
              userId: session.user.id,
              name: skill.name || '',
              category: categoryName,
            }
          })
          allSkills.push(newSkill)
        }
      }
      
      // Group skills by category for response
      const groupedSkills = allSkills.reduce((acc: any, skill) => {
        const category = skill.category || 'Uncategorized'
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(skill)
        return acc
      }, {})
      
      return NextResponse.json(groupedSkills)
    } else {
      // Single skill update (existing logic)
      const { id, ...data } = body
      
      if (!id) {
        return NextResponse.json({ error: 'Skill ID required for individual updates' }, { status: 400 })
      }
      
      const skill = await prisma.skill.update({
        where: { 
          id,
          userId: session.user.id
        },
        data: {
          name: data.name,
          category: data.category,
        }
      })

      return NextResponse.json(skill)
    }
  } catch (error) {
    console.error('Error updating skill:', error)
    return NextResponse.json({ error: 'Failed to update skill' }, { status: 500 })
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
    const category = searchParams.get('category')
    
    if (category) {
      // Delete all skills in a category
      await prisma.skill.deleteMany({
        where: { 
          userId: session.user.id,
          category: category
        }
      })
      return NextResponse.json({ success: true })
    }
    
    if (id) {
      // Delete single skill
      await prisma.skill.delete({
        where: { 
          id,
          userId: session.user.id // Ensure user owns this skill
        }
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Skill ID or category required' }, { status: 400 })
  } catch (error) {
    console.error('Error deleting skill:', error)
    return NextResponse.json({ error: 'Failed to delete skill' }, { status: 500 })
  }
}