import { NextRequest, NextResponse } from 'next/server'

const NVIDIA_API_KEY = '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'
const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { model, messages, max_tokens = 512, temperature = 0.7 } = body

    const response = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'nvidia/nemotron-3-8b-instruct',
        messages: messages || [],
        max_tokens,
        temperature,
        top_p: 1.0,
        stream: false
      })
    })

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to call NVIDIA API' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'NVIDIA Build API',
    models: [
      { id: 'nvidia/nemotron-3-8b-instruct', name: 'Nemotron 3', free: true },
      { id: 'meta/llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick', free: false }
    ],
    endpoint: NVIDIA_API_URL
  })
}
