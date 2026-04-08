import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/prompts - Get prompt history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const favorites = searchParams.get('favorites') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')

    const prompts = await db.promptHistory.findMany({
      where: favorites ? { isFavorite: true } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ success: true, data: prompts })
  } catch (error) {
    console.error('Error fetching prompts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prompts' },
      { status: 500 }
    )
  }
}

// POST /api/prompts - Save a new prompt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mode, variant, tone, task, prompt, charCount } = body

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const saved = await db.promptHistory.create({
      data: {
        mode: mode || 'base',
        variant,
        tone,
        task,
        prompt,
        charCount: charCount || prompt.length,
      },
    })

    return NextResponse.json({ success: true, data: saved })
  } catch (error) {
    console.error('Error saving prompt:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save prompt' },
      { status: 500 }
    )
  }
}

// DELETE /api/prompts - Delete a prompt
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      )
    }

    await db.promptHistory.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting prompt:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete prompt' },
      { status: 500 }
    )
  }
}
