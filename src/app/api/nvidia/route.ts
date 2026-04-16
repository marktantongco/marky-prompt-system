import { NextRequest, NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════
// NVIDIA Build API Integration
// Models: Llama 4 Maverick, Nemotron 3 Super Free
// ═══════════════════════════════════════════════════════════════

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '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'
const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'

// Available models
const NVIDIA_MODELS = {
  'llama-4-maverick': 'meta/llama-4-maverick-17b-128e-instruct',
  'nemotron-3-super': 'nvidia/nemotron-3-super-49b-v1',
  'llama-3.1-nemotron': 'nvidia/llama-3.1-nemotron-70b-instruct',
  'nemotron-4': 'nvidia/nemotron-4-340b-instruct'
}

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      messages,
      model = 'llama-4-maverick',
      max_tokens = 2048,
      temperature = 0.7,
      top_p = 1.0,
      frequency_penalty = 0.0,
      presence_penalty = 0.0,
      stream = false
    } = body

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Get model ID
    const modelId = NVIDIA_MODELS[model as keyof typeof NVIDIA_MODELS] || NVIDIA_MODELS['llama-4-maverick']

    // Build headers
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': stream ? 'text/event-stream' : 'application/json'
    }

    // Build payload
    const payload = {
      model: modelId,
      messages: messages.map((msg: Message) => ({
        role: msg.role,
        content: msg.content
      })),
      max_tokens,
      temperature,
      top_p,
      frequency_penalty,
      presence_penalty,
      stream
    }

    // Make request to NVIDIA API
    const response = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('NVIDIA API Error:', errorText)
      return NextResponse.json(
        { error: `NVIDIA API error: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    if (stream) {
      // For streaming, we need to handle SSE
      const reader = response.body?.getReader()
      if (!reader) {
        return NextResponse.json({ error: 'Stream reader not available' }, { status: 500 })
      }

      // Create a TransformStream for streaming response
      const stream = new ReadableStream({
        async start(controller) {
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              controller.enqueue(value)
            }
            controller.close()
          } catch (error) {
            controller.error(error)
          }
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      })
    } else {
      // Non-streaming response
      const data = await response.json()
      return NextResponse.json(data)
    }

  } catch (error) {
    console.error('NVIDIA API Route Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

// GET endpoint to list available models
export async function GET() {
  return NextResponse.json({
    models: Object.entries(NVIDIA_MODELS).map(([key, id]) => ({
      id: key,
      modelId: id,
      name: id.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || key
    })),
    defaultModel: 'llama-4-maverick',
    capabilities: ['chat', 'completion', 'streaming']
  })
}
