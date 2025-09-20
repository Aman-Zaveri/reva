/**
 * API Route: /api/hub/skills
 * Handles CRUD operations for user's skill data.
 *
 * GET: Returns all skills for the authenticated user, grouped by category.
 * POST: Creates one or more skills for the authenticated user.
 * PUT: Updates one or more skills for the authenticated user.
 * DELETE: Deletes a skill or all skills in a category for the authenticated user.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { skillSchema, updateSkillSchema, validateRequest } from '@/lib/validation'

/**
 * GET handler for skills.
 * Returns all skills for the authenticated user, grouped by category.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch skills from database
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
    // Log and return error response
    console.error('Error fetching skills:', error)
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 })
  }
}

/**
 * POST handler for skills.
 * Creates one or more skills for the authenticated user.
 * Supports bulk creation for a category and single skill creation.
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

      // Create all skills in database
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

    // Create single skill in database
    const skill = await prisma.skill.create({
      data: {
        userId: session.user.id,
        name: data.name,
        category: data.category,
      }
    })

    return NextResponse.json(skill)
  } catch (error) {
    // Log and return error response
    console.error('Error creating skill:', error)
    return NextResponse.json({ error: 'Failed to create skill' }, { status: 500 })
  }
}

/**
 * PUT handler for skills.
 * Updates one or more skills for the authenticated user.
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
          // Create new skill in database
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
      // Single skill update
      const { id, ...data } = body

      if (!id) {
        return NextResponse.json({ error: 'Skill ID required for individual updates' }, { status: 400 })
      }

      // Update skill in database
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
    // Log and return error response
    console.error('Error updating skill:', error)
    return NextResponse.json({ error: 'Failed to update skill' }, { status: 500 })
  }
}

/**
 * DELETE handler for skills.
 * Deletes a skill or all skills in a category for the authenticated user.
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get skill ID and category from query params
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
    // Log and return error response
    console.error('Error deleting skill:', error)
    return NextResponse.json({ error: 'Failed to delete skill' }, { status: 500 })
  }
}