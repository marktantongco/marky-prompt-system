'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface PromptRecord {
  id: string
  mode: string
  variant: string | null
  tone: string | null
  task: string | null
  prompt: string
  isFavorite: boolean
  charCount: number
  createdAt: string
}

interface ModuleConfig {
  id: string
  label: string
  description: string
  enabled: boolean
  content: string
  category?: 'core' | 'addon' | 'skill'
}

interface Preset {
  id: string
  name: string
  createdAt: string
  config: {
    mode: 'master' | 'glm' | 'concise'
    modules: Record<string, boolean>
    task: string
  }
}

// ═══════════════════════════════════════════════════════════════
// MASTER PROMPT v3.5 - MODULAR SYSTEM
// ═══════════════════════════════════════════════════════════════

const PROMPT_MODULES: Record<string, ModuleConfig> = {
  // CORE MODULES
  role: {
    id: 'role',
    label: 'Role Definition',
    description: 'Who the AI acts as',
    enabled: true,
    category: 'core',
    content: `You are my expert AI partner, business strategist, and creative technologist.
Act in MY best interest. Identify what I truly need — not just what I asked.`
  },
  coreRules: {
    id: 'coreRules',
    label: 'Core Rules',
    description: '10 fundamental operating principles',
    enabled: true,
    category: 'core',
    content: `## ⚡ CORE RULES

1. No filler. No fluff. No disclaimers. No "as an AI" statements.
2. WORKING code only — never pseudocode. Test logic mentally before outputting.
3. Rank by impact. Lead with the highest-leverage action or idea.
4. Always flag a better or faster way if one exists. Advocacy is always on.
5. Assume expert-level. On vague requests: assume smartly, state it, proceed.
6. Risky? Flag it in one line — then execute unless I say stop.
7. Never ask me to repeat context. Use conversation history. Every message stands alone.
8. Format for scanability: headers, bullets, bold, whitespace.
9. Short sentences. Simple words — 4th grade level. One idea per sentence.
10. Quality over speed. Push back if you have a strong reason.`
  },
  hardStops: {
    id: 'hardStops',
    label: 'Hard Stops',
    description: 'Non-negotiable constraints',
    enabled: true,
    category: 'core',
    content: `## 🛡️ HARD STOPS

- No placeholder text. Never write TODO, "[your code]", or "insert here".
- No apologies for limitations. Solve it or pivot.
- Never restate my request. Jump straight to the solution.
- No vague language. Not "might", "could", or "perhaps". Be direct.`
  },
  responseFramework: {
    id: 'responseFramework',
    label: 'Response Framework',
    description: 'Structure for complex tasks',
    enabled: true,
    category: 'core',
    content: `## 🧠 RESPONSE FRAMEWORK (Complex Tasks Only)

1. **Structure First** — outline silently, then execute.
2. **Impact-Rank** — lead with the 80/20 action or insight.
3. **Show, Don't Tell** — working code > explanation. Artifacts > prose.
4. **Close with Momentum** — ⚡ **Next Step**: max 2 sentences, one action.
5. **Close with Insight** — ✨ **3 Suggestions** — exactly 3.

Skip closing blocks on one-liners, confirmations, and simple factual replies.`
  },
  advocacy: {
    id: 'advocacy',
    label: 'Advocacy Mode',
    description: 'AI acts as your advocate',
    enabled: true,
    category: 'core',
    content: `## 🚀 ADVOCACY

- Warn me before I make a mistake.
- Suggest better approaches even when I didn't ask.
- Optimize for my long-term success — not just task completion.
- Push back if you have a strong reason. Quality over speed, always.`
  },
  writingRules: {
    id: 'writingRules',
    label: 'Writing Rules',
    description: 'Voice and tone guidelines',
    enabled: true,
    category: 'core',
    content: `## ✍️ WRITING RULES

- Short sentences. Every word earns its place.
- 4th grade reading level. One idea per sentence.
- Write to ONE person. Use "you" — never corporate speak or brand generics.
- Think deeply. Write clearly. Let ideas lead.
- Format for scanability — headers, bullets, bold, whitespace.`
  },
  skillLibrary: {
    id: 'skillLibrary',
    label: 'Skill Library',
    description: 'External skill references',
    enabled: true,
    category: 'core',
    content: `## 🧰 SKILL LIBRARY

Fetch before relevant tasks. Pull the reference first — never guess.

**Primary:**
- Agents + Workflows: https://raw.githubusercontent.com/marktantongco/ai-skills-library/main/AGENTS.md
- GSAP Animations: https://raw.githubusercontent.com/xerxes-on/gsap-animation-skill/main/gsap-animations.md
- Photography AI: https://marktantongco.github.io/aiskills-photog/skills.md
- NVIDIA Build API: https://raw.githubusercontent.com/marktantongco/ai-skills-library/main/nvidia-build.md

**Secondary:**
- Frontend Design + UI/UX Pro Max: https://skills.sh/`
  },
  specialCommands: {
    id: 'specialCommands',
    label: 'Special Commands',
    description: '//clear, //focus, //audit, //nvidia',
    enabled: true,
    category: 'core',
    content: `## 🔄 SPECIAL COMMANDS

- \`//clear\` — Reset all context. Next message = new session start.
- \`//focus [topic]\` — Set project context for this session only.
- \`//audit\` — Review this prompt. Flag dead rules. Suggest upgrades.
- \`//nvidia\` — Inject the full NVIDIA Build API integration.`
  },
  context: {
    id: 'context',
    label: 'powerUP Context',
    description: 'Project and brand context',
    enabled: true,
    category: 'core',
    content: `## 💡 YOUR CONTEXT

Building under **powerUP**: AI tools, digital products, web experiences, monetization systems.

- Stack: React/Vite · Next.js 15 · WebGPU/R3F · GSAP · Vercel
- Aesthetic: Neo-Brutalist — #FFEA00 + void black · Syne + Space Mono
- Voice: Faith-backed · empowerment-toned · direct · actionable

Use \`//focus [topic]\` to inject current project context per session.`
  },
  
  // ADD-ON MODULES
  codeMode: {
    id: 'codeMode',
    label: '+Code Module',
    description: 'Enhanced coding rules',
    enabled: false,
    category: 'addon',
    content: `## 💻 CODE MODE: ON

- Always provide complete, runnable code — no placeholders
- Include error handling by default
- Add type definitions for TypeScript
- Include comments for complex logic only
- Follow clean code principles
- Consider edge cases proactively`
  },
  designMode: {
    id: 'designMode',
    label: '+Design Module',
    description: 'UI/UX design guidelines',
    enabled: false,
    category: 'addon',
    content: `## 🎨 DESIGN MODE: ON

- Use Tailwind CSS for styling
- Mobile-first responsive design
- WCAG AA accessibility minimum
- 60fps animation budget
- Semantic HTML structure
- Support dark mode by default
- Neo-Brutalist aesthetic: #FFEA00 + void black`
  },
  copyMode: {
    id: 'copyMode',
    label: '+Copywriting Module',
    description: 'Copywriting frameworks',
    enabled: false,
    category: 'addon',
    content: `## ✍️ COPYWRITING MODE: ON

- Lead with emotion. Logic closes. Emotion opens.
- Open with the problem, not the product.
- One big idea per piece. No cramming.
- Use "you" more than "I" or "we."
- Make the CTA feel like relief — not pressure.
- AIDA, PAS, 4Ps — choose framework, execute.`
  },
  
  // SKILL MODULES
  nvidiaSkill: {
    id: 'nvidiaSkill',
    label: '🤖 NVIDIA Build API',
    description: 'Llama 4 + Nemotron 3 (FREE)',
    enabled: false,
    category: 'skill',
    content: `## 📦 NVIDIA BUILD API SKILL

**API Token:** \`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\`

**Endpoint:** \`https://integrate.api.nvidia.com/v1/chat/completions\`

**Available Models:**
- \`nvidia/nemotron-3-8b-instruct\` — Nemotron 3 (FREE)
- \`meta/llama-4-maverick-17b-128e-instruct\` — Llama 4 Maverick

**Sample Python Code:**
\`\`\`python
import requests

invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"

headers = {
  "Authorization": "Bearer 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",
  "Accept": "application/json"
}

payload = {
  "model": "nvidia/nemotron-3-8b-instruct",  # FREE model
  "messages": [{"role": "user", "content": "Your prompt here"}],
  "max_tokens": 512,
  "temperature": 0.7
}

response = requests.post(invoke_url, headers=headers, json=payload)
print(response.json())
\`\`\`

**Usage:** Token is valid and ready. Write production-ready integration code.`
  }
}

// Mode configurations
const MODE_CONFIGS = {
  master: {
    label: 'Master',
    number: '1',
    emoji: '⚡',
    tag: 'Full System',
    preview: 'Complete prompt with all sections active.',
    enabledModules: ['role', 'coreRules', 'hardStops', 'responseFramework', 'advocacy', 'writingRules', 'skillLibrary', 'specialCommands', 'context']
  },
  glm: {
    label: 'GLM Optimized',
    number: '2',
    emoji: '🧠',
    tag: 'GLM Native',
    preview: 'Core rules + Advocacy + Writing Rules. Stripped for GLM context limits.',
    enabledModules: ['role', 'coreRules', 'hardStops', 'advocacy', 'writingRules']
  },
  concise: {
    label: 'Concise',
    number: '3',
    emoji: '🚀',
    tag: 'Fastest',
    preview: 'Only Core Rules + Hard Stops + Response Framework.',
    enabledModules: ['role', 'coreRules', 'hardStops', 'responseFramework']
  }
}

// Token estimation
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

// ═══════════════════════════════════════════════════════════════
// AMBIENT BACKGROUND
// ═══════════════════════════════════════════════════════════════

function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-50 animate-float"
        style={{ background: 'linear-gradient(135deg, rgba(245, 197, 24, 0.4), transparent)', top: '-100px', right: '-100px' }}
      />
      <div className="absolute w-[250px] h-[250px] rounded-full blur-[80px] opacity-50 animate-float"
        style={{ background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.3), transparent)', bottom: '20%', left: '-80px', animationDelay: '-7s' }}
      />
      <div className="absolute w-[200px] h-[200px] rounded-full blur-[80px] opacity-40 animate-float"
        style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), transparent)', top: '50%', right: '-50px', animationDelay: '-14s' }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// NVIDIA API PANEL
// ═══════════════════════════════════════════════════════════════

function NvidiaPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedModel, setSelectedModel] = useState('nvidia/nemotron-3-8b-instruct')
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const testApi = async () => {
    setLoading(true)
    setResponse('')
    
    try {
      const res = await fetch('/api/nvidia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: 'user', content: prompt || 'Hello!' }]
        })
      })
      
      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (e: any) {
      setResponse(`Error: ${e.message}`)
    }
    
    setLoading(false)
  }

  const copyCode = async () => {
    const code = `import requests

invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"

headers = {
  "Authorization": "Bearer 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",
  "Accept": "application/json"
}

payload = {
  "model": "${selectedModel}",
  "messages": [{"role": "user", "content": "${prompt || 'Your prompt here'}"}],
  "max_tokens": 512,
  "temperature": 0.7
}

response = requests.post(invoke_url, headers=headers, json=payload)
print(response.json())`
    
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <>
      <motion.div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="fixed z-[201] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-[500px] glass rounded-3xl p-6 border border-white/5 max-h-[80vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 transition-colors">×</button>
        
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🤖</span>
          <div>
            <h3 className="text-lg font-bold text-white">NVIDIA Build API</h3>
            <p className="text-xs text-white/40">Llama 4 + Nemotron 3 Super (FREE)</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Model</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setSelectedModel('nvidia/nemotron-3-8b-instruct')} className={`p-3 rounded-xl text-left text-sm transition-all ${selectedModel === 'nvidia/nemotron-3-8b-instruct' ? 'bg-[#76b900]/20 border-[#76b900]/50 text-white' : 'bg-white/5 border-white/5 text-white/60'} border`}>
                <span className="block font-medium">Nemotron 3</span>
                <span className="text-[10px] text-green-400">FREE</span>
              </button>
              <button onClick={() => setSelectedModel('meta/llama-4-maverick-17b-128e-instruct')} className={`p-3 rounded-xl text-left text-sm transition-all ${selectedModel === 'meta/llama-4-maverick-17b-128e-instruct' ? 'bg-[#76b900]/20 border-[#76b900]/50 text-white' : 'bg-white/5 border-white/5 text-white/60'} border`}>
                <span className="block font-medium">Llama 4 Maverick</span>
                <span className="text-[10px] text-[#f5c518]">17B</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Test Prompt</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Enter a test prompt..." className="w-full h-24 bg-black/50 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#f5c518]/50 resize-none" />
          </div>

          <div className="flex gap-2">
            <button onClick={testApi} disabled={loading} className="flex-1 py-3 rounded-xl font-semibold bg-[#76b900] text-black disabled:opacity-50">
              {loading ? 'Testing...' : '🧪 Test API'}
            </button>
            <button onClick={copyCode} className="py-3 px-4 rounded-xl font-medium bg-white/5 border border-white/10 text-white/70 hover:bg-white/10">
              {copied ? '✓' : '📋'}
            </button>
          </div>

          {response && (
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Response</label>
              <pre className="bg-black/50 border border-white/10 rounded-xl p-4 text-xs text-white/60 overflow-x-auto max-h-48">{response}</pre>
            </div>
          )}

          <div className="p-4 bg-white/5 rounded-xl">
            <p className="text-xs text-white/40 mb-2"><span className="text-[#f5c518]">⚠️</span> Token is embedded in prompt. For production, use environment variable.</p>
            <code className="text-[10px] text-white/30 break-all">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</code>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function MarkyPromptBuilder() {
  const [mode, setMode] = useState<'master' | 'glm' | 'concise'>('master')
  const [task, setTask] = useState('')
  const [copied, setCopied] = useState(false)
  const [copiedMd, setCopiedMd] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [saved, setSaved] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [presetModalOpen, setPresetModalOpen] = useState(false)
  const [nvidiaPanelOpen, setNvidiaPanelOpen] = useState(false)
  const [showBuilder, setShowBuilder] = useState(false)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [history, setHistory] = useState<PromptRecord[]>([])
  const [showFavorites, setShowFavorites] = useState(false)
  const [presets, setPresets] = useState<Preset[]>([])
  
  const [modules, setModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    Object.values(PROMPT_MODULES).forEach(m => {
      initial[m.id] = MODE_CONFIGS.master.enabledModules.includes(m.id)
    })
    return initial
  })

  // Load presets from localStorage
  useEffect(() => {
    const savedPresets = localStorage.getItem('marky-presets-v2')
    if (savedPresets) {
      try { setPresets(JSON.parse(savedPresets)) } catch (e) { }
    }
  }, [])

  // Update modules when mode changes
  useEffect(() => {
    const config = MODE_CONFIGS[mode]
    setModules(prev => {
      const updated = { ...prev }
      Object.values(PROMPT_MODULES).forEach(m => {
        if (m.category === 'core') {
          updated[m.id] = config.enabledModules.includes(m.id)
        }
      })
      return updated
    })
  }, [mode])

  // Build the prompt
  const buildPrompt = useCallback(() => {
    const parts: string[] = []
    const moduleOrder = ['role', 'coreRules', 'hardStops', 'responseFramework', 'advocacy', 'writingRules', 'skillLibrary', 'specialCommands', 'context', 'codeMode', 'designMode', 'copyMode', 'nvidiaSkill']
    
    moduleOrder.forEach(id => {
      if (modules[id] && PROMPT_MODULES[id]) {
        parts.push(PROMPT_MODULES[id].content)
      }
    })
    
    return parts.join('\n\n')
  }, [modules])

  const getFinalPrompt = useCallback(() => {
    const base = buildPrompt()
    return task.trim() ? `${base}\n\n---\n\n## 🎯 MY TASK\n\n${task.trim()}` : base
  }, [buildPrompt, task])

  const tokenCount = useMemo(() => estimateTokens(getFinalPrompt()), [getFinalPrompt])
  const charCount = getFinalPrompt().length
  const moduleCount = Object.entries(modules).filter(([id, enabled]) => enabled && PROMPT_MODULES[id]).length

  // Copy functions - NO ALERTS
  const copyToClipboard = async (format: 'plain' | 'markdown' | 'url' = 'plain') => {
    let text: string
    
    if (format === 'url') {
      const params = new URLSearchParams()
      params.set('mode', mode)
      if (task) params.set('task', encodeURIComponent(task))
      text = `${window.location.origin}${window.location.pathname}?${params.toString()}`
    } else if (format === 'markdown') {
      text = `\`\`\`\n${getFinalPrompt()}\n\`\`\``
    } else {
      text = getFinalPrompt()
    }
    
    try {
      await navigator.clipboard.writeText(text)
      if (format === 'plain') { setCopied(true); setTimeout(() => setCopied(false), 2000) }
      else if (format === 'markdown') { setCopiedMd(true); setTimeout(() => setCopiedMd(false), 2000) }
      else { setCopiedUrl(true); setTimeout(() => setCopiedUrl(false), 2000) }
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      if (format === 'plain') { setCopied(true); setTimeout(() => setCopied(false), 2000) }
    }
  }

  const savePrompt = async () => {
    try {
      await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, variant: mode, tone: null, task: task.trim() || null, prompt: getFinalPrompt(), charCount })
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      fetchFavoritesCount()
    } catch (e) {
      console.error('Failed to save:', e)
    }
  }

  const savePreset = (name: string) => {
    const newPreset: Preset = { id: Date.now().toString(), name, createdAt: new Date().toISOString(), config: { mode, modules: { ...modules }, task } }
    const updated = [...presets, newPreset]
    setPresets(updated)
    localStorage.setItem('marky-presets-v2', JSON.stringify(updated))
  }

  const loadPreset = (preset: Preset) => {
    setMode(preset.config.mode)
    setModules(preset.config.modules)
    setTask(preset.config.task)
  }

  const fetchFavoritesCount = useCallback(async () => {
    try {
      const res = await fetch('/api/prompts?favorites=true&limit=100')
      const data = await res.json()
      if (data.success) setFavoritesCount(data.data.length)
    } catch (e) { }
  }, [])

  useEffect(() => { fetchFavoritesCount() }, [fetchFavoritesCount])

  // URL state management
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlMode = params.get('mode')
    const urlTask = params.get('task')
    if (urlMode && ['master', 'glm', 'concise'].includes(urlMode)) setMode(urlMode as typeof mode)
    if (urlTask) setTask(decodeURIComponent(urlTask))
  }, [])

  const toggleModule = (id: string) => {
    setModules(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white relative noise-overlay">
      <AmbientBackground />
      
      <div className="relative z-10 max-w-md mx-auto px-4 pt-safe-top pb-40">
        {/* Header */}
        <motion.header className="flex items-start justify-between py-5 mb-6 border-b border-white/5" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient-gold">MARKY</h1>
            <p className="text-[10px] tracking-widest uppercase text-white/40 mt-1 font-medium">AI Prompt Builder · v3.5 Master</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setNvidiaPanelOpen(true)} className="w-9 h-9 rounded-xl bg-[#76b900]/20 border border-[#76b900]/30 flex items-center justify-center text-[#76b900] hover:bg-[#76b900]/30 transition-all" title="NVIDIA Build API">
              <span className="text-base">🤖</span>
            </button>
            <button onClick={() => setPresetModalOpen(true)} className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 transition-all" title="Presets">
              <span className="text-base">📂</span>
            </button>
            <button onClick={() => setHistoryOpen(true)} className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 transition-all" title="History">
              <span className="text-base">⏱</span>
              {favoritesCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#f5c518] text-black text-[9px] font-bold flex items-center justify-center">{favoritesCount}</span>}
            </button>
            <span className="font-mono text-[9px] text-white/30 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">v3.5</span>
          </div>
        </motion.header>

        {/* Build Prompt Button */}
        <AnimatePresence>
          {!showBuilder && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-6">
              <button onClick={() => setShowBuilder(true)} className="w-full glass rounded-2xl p-6 text-left hover:bg-white/[0.07] transition-all group relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-gold transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl block mb-2">⚡</span>
                    <span className="text-lg font-bold block mb-1">Build Your System Prompt</span>
                    <span className="text-sm text-white/40">Toggle modules · Configure modes · Save presets</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#f5c518]/10 flex items-center justify-center">
                    <span className="text-[#f5c518] text-2xl">→</span>
                  </div>
                </div>
              </button>
              
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <span className="text-xl font-bold text-[#f5c518]">{tokenCount}</span>
                  <span className="text-[10px] text-white/40 block mt-1">tokens</span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <span className="text-xl font-bold text-white">{charCount}</span>
                  <span className="text-[10px] text-white/40 block mt-1">chars</span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <span className="text-xl font-bold text-white">{moduleCount}</span>
                  <span className="text-[10px] text-white/40 block mt-1">modules</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Builder Interface */}
        <AnimatePresence>
          {showBuilder && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button onClick={() => setShowBuilder(false)} className="w-full mb-4 py-2 text-center text-xs text-white/40 hover:text-white/60 transition-colors">↑ Collapse Builder</button>

              {/* Task Section */}
              <motion.section className="mb-6" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                <div className="glass rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-gold" />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold tracking-widest uppercase text-[#f5c518]">What's your task?</span>
                    <span className="text-[9px] tracking-widest uppercase text-white/30 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">Optional</span>
                  </div>
                  <textarea value={task} onChange={(e) => setTask(e.target.value)} placeholder="Type your task here..." className="w-full min-h-[100px] bg-black/50 border border-white/5 rounded-xl p-4 text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-[#f5c518]/50 focus:ring-2 focus:ring-[#f5c518]/20 transition-all font-sans" />
                </div>
              </motion.section>

              {/* Mode Section */}
              <motion.section className="mb-6" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
                <p className="text-[10px] tracking-widest uppercase text-white/40 mb-3 flex items-center gap-2"><span className="w-4 h-px bg-white/10" />Mode</p>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(MODE_CONFIGS).map(([id, config]) => (
                    <div key={id} className="relative" onMouseEnter={() => setHoveredCard(`mode-${id}`)} onMouseLeave={() => setHoveredCard(null)}>
                      <button onClick={() => setMode(id as typeof mode)} className={`relative w-full p-4 rounded-2xl text-center transition-all duration-300 ${mode === id ? 'bg-white/10 border-[#f5c518]/50' : 'bg-white/5 border-white/5 hover:bg-white/[0.07] active:scale-95'} border`}>
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-gold transform origin-left transition-transform duration-300" style={{ transform: mode === id ? 'scaleX(1)' : 'scaleX(0)' }} />
                        <span className={`text-2xl font-bold block mb-1 transition-all ${mode === id ? 'text-[#f5c518] glow-gold-text' : 'text-white/30'}`}>{config.number}</span>
                        <span className="text-[9px] tracking-widest uppercase text-white/40">{config.label}</span>
                        {mode === id && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#22c55e] flex items-center justify-center"><span className="text-xs text-black">✓</span></motion.div>}
                      </button>
                      <AnimatePresence>
                        {hoveredCard === `mode-${id}` && (
                          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute z-10 top-full left-0 right-0 mt-2 p-3 glass rounded-xl text-[11px] text-white/60">
                            <span className="text-[9px] text-[#ff6b35] uppercase tracking-wide">{config.tag}</span>
                            <p className="mt-1">{config.preview}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* Modules Section */}
              <motion.section className="mb-6" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                <p className="text-[10px] tracking-widest uppercase text-white/40 mb-3 flex items-center gap-2"><span className="w-4 h-px bg-white/10" />Modules · Toggle to customize</p>
                
                {/* Core Modules */}
                <div className="space-y-2 mb-4">
                  <p className="text-[9px] text-white/30 uppercase tracking-wide">Core</p>
                  {Object.values(PROMPT_MODULES).filter(m => m.category === 'core').map((mod) => (
                    <button key={mod.id} onClick={() => toggleModule(mod.id)} className={`w-full p-4 rounded-xl text-left transition-all duration-300 flex items-center gap-4 ${modules[mod.id] ? 'bg-white/10 border-[#f5c518]/30' : 'bg-white/5 border-white/5 hover:bg-white/[0.07]'} border`}>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${modules[mod.id] ? 'bg-[#f5c518] border-[#f5c518]' : 'border-white/20'}`}>
                        {modules[mod.id] && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-black text-xs">✓</motion.span>}
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm font-medium block ${modules[mod.id] ? 'text-white' : 'text-white/50'}`}>{mod.label}</span>
                        <span className="text-[10px] text-white/30">{mod.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Add-on Modules */}
                <div className="space-y-2 mb-4">
                  <p className="text-[9px] text-white/30 uppercase tracking-wide">Add-ons</p>
                  {Object.values(PROMPT_MODULES).filter(m => m.category === 'addon').map((mod) => (
                    <button key={mod.id} onClick={() => toggleModule(mod.id)} className={`w-full p-4 rounded-xl text-left transition-all duration-300 flex items-center gap-4 ${modules[mod.id] ? 'bg-white/10 border-[#ff6b35]/30' : 'bg-white/5 border-white/5 hover:bg-white/[0.07]'} border`}>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${modules[mod.id] ? 'bg-[#ff6b35] border-[#ff6b35]' : 'border-white/20'}`}>
                        {modules[mod.id] && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-black text-xs">✓</motion.span>}
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm font-medium block ${modules[mod.id] ? 'text-white' : 'text-white/50'}`}>{mod.label}</span>
                        <span className="text-[10px] text-white/30">{mod.description}</span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#ff6b35]/20 text-[#ff6b35]">ADD-ON</span>
                    </button>
                  ))}
                </div>
                
                {/* Skill Modules */}
                <div className="space-y-2">
                  <p className="text-[9px] text-white/30 uppercase tracking-wide">Skills</p>
                  {Object.values(PROMPT_MODULES).filter(m => m.category === 'skill').map((mod) => (
                    <button key={mod.id} onClick={() => toggleModule(mod.id)} className={`w-full p-4 rounded-xl text-left transition-all duration-300 flex items-center gap-4 ${modules[mod.id] ? 'bg-white/10 border-[#76b900]/30' : 'bg-white/5 border-white/5 hover:bg-white/[0.07]'} border`}>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${modules[mod.id] ? 'bg-[#76b900] border-[#76b900]' : 'border-white/20'}`}>
                        {modules[mod.id] && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-black text-xs">✓</motion.span>}
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm font-medium block ${modules[mod.id] ? 'text-white' : 'text-white/50'}`}>{mod.label}</span>
                        <span className="text-[10px] text-white/30">{mod.description}</span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#76b900]/20 text-[#76b900]">SKILL</span>
                    </button>
                  ))}
                </div>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Output Section */}
        <motion.section className="mb-6" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] tracking-widest uppercase text-white/40 flex items-center gap-2"><span className="w-4 h-px bg-white/10" />Prompt Preview</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#f5c518] bg-[#f5c518]/10 px-2 py-1 rounded-full">~{tokenCount} tokens</span>
              <span className="font-mono text-[10px] text-white/30 bg-white/5 px-2 py-1 rounded-full border border-white/5">{charCount.toLocaleString()} chars</span>
            </div>
          </div>
          <div className="glass rounded-2xl p-5">
            <pre className="font-mono text-[11px] leading-relaxed text-white/60 whitespace-pre-wrap break-words max-h-[250px] overflow-y-auto">{buildPrompt()}</pre>
          </div>
        </motion.section>

        {/* Quick Reference */}
        <motion.section className="pt-6 border-t border-white/5" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
          <p className="text-[10px] tracking-widest uppercase text-white/40 mb-3 flex items-center gap-2"><span className="w-4 h-px bg-white/10" />Quick Reference</p>
          <div className="grid grid-cols-3 gap-3">
            {[{ label: 'Master', text: 'Full system prompt' }, { label: 'GLM', text: 'Optimized for GLM' }, { label: 'Concise', text: 'Minimal tokens' }].map((tip, i) => (
              <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-3">
                <span className="text-[9px] tracking-widest uppercase text-[#f5c518] block mb-1 font-semibold">{tip.label}</span>
                <span className="text-[10px] text-white/40 leading-relaxed">{tip.text}</span>
              </div>
            ))}
          </div>
        </motion.section>
      </div>

      {/* Fixed Quick Actions Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe-bottom bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent">
        <div className="max-w-md mx-auto">
          <div className="flex gap-2 mb-3">
            <motion.button onClick={() => copyToClipboard('plain')} className="flex-1 py-2.5 rounded-xl font-medium text-xs transition-all duration-300 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10" whileTap={{ scale: 0.98 }}>{copied ? '✓ Copied!' : '📄 Plain'}</motion.button>
            <motion.button onClick={() => copyToClipboard('markdown')} className="flex-1 py-2.5 rounded-xl font-medium text-xs transition-all duration-300 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10" whileTap={{ scale: 0.98 }}>{copiedMd ? '✓ Copied!' : '📋 Markdown'}</motion.button>
            <motion.button onClick={() => copyToClipboard('url')} className="flex-1 py-2.5 rounded-xl font-medium text-xs transition-all duration-300 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10" whileTap={{ scale: 0.98 }}>{copiedUrl ? '✓ Copied!' : '🔗 URL'}</motion.button>
            <motion.button onClick={savePrompt} className="flex-1 py-2.5 rounded-xl font-medium text-xs transition-all duration-300 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10" whileTap={{ scale: 0.98 }}>{saved ? '✓ Saved!' : '☆ Save'}</motion.button>
          </div>
          <motion.button onClick={() => copyToClipboard('plain')} className={`w-full py-4 rounded-2xl font-semibold text-base tracking-wide relative overflow-hidden transition-all duration-300 ${copied ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-gold'} text-black`} whileTap={{ scale: 0.98 }}>
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="text-lg">{copied ? '✓' : '⎘'}</span>
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Prompt'}</span>
            </span>
          </motion.button>
        </div>
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {historyOpen && (
          <>
            <motion.div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setHistoryOpen(false)} />
            <motion.div className="fixed z-[151] top-0 right-0 h-full w-full max-w-sm bg-[#0a0a0a] border-l border-white/5 overflow-hidden flex flex-col" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gradient-gold">History</h2>
                <button onClick={() => setHistoryOpen(false)} className="w-8 h-8 rounded-full bg-white/5 text-white/50 hover:bg-white/10 transition-colors">×</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="text-center text-white/30 py-8"><span className="text-3xl block mb-2">📝</span>No history yet</div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Preset Modal */}
      <AnimatePresence>
        {presetModalOpen && (
          <>
            <motion.div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPresetModalOpen(false)} />
            <motion.div className="fixed z-[201] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-[400px] glass rounded-3xl p-6 border border-white/5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <button onClick={() => setPresetModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 transition-colors">×</button>
              <h3 className="text-lg font-bold text-white mb-4">Presets</h3>
              {presets.length === 0 ? (
                <div className="text-center text-white/30 py-8"><span className="text-2xl block mb-2">📂</span>No saved presets yet</div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {presets.map((preset) => (
                    <button key={preset.id} onClick={() => { loadPreset(preset); setPresetModalOpen(false) }} className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left">
                      <span className="font-medium text-white">{preset.name}</span>
                      <span className="text-[10px] text-white/30 block mt-1">{preset.config.mode} · {Object.values(preset.config.modules).filter(Boolean).length} modules</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <input type="text" placeholder="New preset name..." className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#f5c518]/50 mb-2" onKeyDown={(e) => { if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) { savePreset((e.target as HTMLInputElement).value.trim()); setPresetModalOpen(false) } }} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* NVIDIA Panel */}
      <AnimatePresence>
        {nvidiaPanelOpen && <NvidiaPanel isOpen={nvidiaPanelOpen} onClose={() => setNvidiaPanelOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
