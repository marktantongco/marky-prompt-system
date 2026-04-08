import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PATCH /api/prompts/favorite - Toggle favorite status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, isFavorite } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      )
    }

    const updated = await db.promptHistory.update({
      where: { id },
      data: { isFavorite },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating prompt:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update prompt' },
      { status: 500 }
    )
  }
}
