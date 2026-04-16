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
  // CORE MODULES (Always on in Master mode)
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
5. **Close with Insight** — ✨ **3 Suggestions** — exactly 3. Rules:
   - Genuinely insightful. Not obvious. Not already in the response.
   - Commonly overlooked — what you'd miss without a second perspective.
   - Tied to long-term success, not just the current task.
   - Format: **bold label** + one tight sentence max.
   - Rotate: Tactical / Strategic / Reframe or Contrarian. No repeats.

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
- Swipe file mindset. Reference proven ads, emails, hooks, captions for copy.
- Pattern-match from what works. Don't invent when a proven format exists.
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
- Frontend Design + UI/UX Pro Max + Playwright CLI: https://skills.sh/`
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
  Example: \`//focus Gumroad launch\` · \`//focus Pacific Cross GTM\`
- \`//audit\` — Review this prompt. Flag dead rules. Suggest cuts or upgrades.
- \`//nvidia\` — Inject the full NVIDIA Build API integration (token, sample code, usage).`
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

Use \`//focus [topic]\` to inject current project context per session.
Every response is an investment in long-term success.`
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
- Consider edge cases proactively
- Test logic mentally before outputting`
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
- Swipe file mindset: reference proven formats.
- AIDA, PAS, 4Ps — choose framework, execute.`
  },
  
  // SKILL MODULES
  nvidiaSkill: {
    id: 'nvidiaSkill',
    label: '🤖 NVIDIA Build API',
    description: 'Llama 4 + Nemotron integration',
    enabled: false,
    category: 'skill',
    content: `## 📦 NVIDIA BUILD API SKILL

**API Token:** \`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\`

**Endpoint:** \`https://integrate.api.nvidia.com/v1/chat/completions\`

**Available Models:**
- \`meta/llama-4-maverick-17b-128e-instruct\` — Llama 4 Maverick
- \`nvidia/nemotron-3-8b-instruct\` — Nemotron 3 (FREE)

**Sample Python Code:**
\`\`\`python
import requests

invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
stream = False

headers = {
  "Authorization": "Bearer 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",
  "Accept": "text/event-stream" if stream else "application/json"
}

payload = {
  "model": "nvidia/nemotron-3-8b-instruct",  # FREE model
  "messages": [{"role": "user", "content": "Your prompt here"}],
  "max_tokens": 512,
  "temperature": 0.7,
  "top_p": 1.0,
  "stream": stream
}

response = requests.post(invoke_url, headers=headers, json=payload)
print(response.json())
\`\`\`

**Usage Note:** Token is valid and ready. Write production-ready integration code.`
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

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// Rough token estimation (GPT-style: ~4 chars per token)
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
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// HISTORY PANEL COMPONENT
// ═══════════════════════════════════════════════════════════════

function HistoryPanel({ 
  isOpen, 
  onClose, 
  onSelect,
  onRefresh 
}: { 
  isOpen: boolean
  onClose: () => void
  onSelect: (prompt: PromptRecord) => void
  onRefresh: () => void
}) {
  const [history, setHistory] = useState<PromptRecord[]>([])
  const [showFavorites, setShowFavorites] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    
    let mounted = true
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/prompts?favorites=${showFavorites}&limit=30`)
        const data = await res.json()
        if (mounted && data.success) setHistory(data.data)
      } catch (e) {
        console.error('Failed to fetch history:', e)
      }
      if (mounted) setLoading(false)
    }
    fetchData()
    
    return () => { mounted = false }
  }, [isOpen, showFavorites])

  const toggleFavorite = async (id: string, current: boolean) => {
    try {
      await fetch('/api/prompts/favorite', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isFavorite: !current })
      })
      onRefresh()
    } catch (e) {
      console.error('Failed to toggle favorite:', e)
    }
  }

  const deletePrompt = async (id: string) => {
    try {
      await fetch(`/api/prompts?id=${id}`, { method: 'DELETE' })
      onRefresh()
    } catch (e) {
      console.error('Failed to delete:', e)
    }
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed z-[151] top-0 right-0 h-full w-full max-w-sm bg-[#0a0a0a] border-l border-white/5 overflow-hidden flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gradient-gold">History</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFavorites(false)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-all ${!showFavorites ? 'bg-[#f5c518] text-black' : 'bg-white/5 text-white/50'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setShowFavorites(true)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-all ${showFavorites ? 'bg-[#f5c518] text-black' : 'bg-white/5 text-white/50'}`}
                >
                  ★ Favorites
                </button>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 text-white/50 hover:bg-white/10 transition-colors ml-2">
                  ×
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="text-center text-white/30 py-8">Loading...</div>
              ) : history.length === 0 ? (
                <div className="text-center text-white/30 py-8">
                  <span className="text-3xl block mb-2">📝</span>
                  {showFavorites ? 'No favorites yet' : 'No history yet'}
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/[0.07] transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                          {item.mode === 'master' ? '⚡' : item.mode === 'glm' ? '🧠' : '🚀'} {item.variant || item.mode}
                        </span>
                        <span className="text-[10px] text-white/30">{item.charCount} chars</span>
                      </div>
                      <span className="text-[10px] text-white/30">{formatDate(item.createdAt)}</span>
                    </div>
                    {item.task && (
                      <p className="text-xs text-white/50 mb-2 line-clamp-1">→ {item.task}</p>
                    )}
                    <p className="text-[11px] text-white/40 line-clamp-2 font-mono mb-3">{item.prompt.slice(0, 100)}...</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelect(item)}
                        className="text-[10px] px-3 py-1 rounded-full bg-[#f5c518]/20 text-[#f5c518] hover:bg-[#f5c518]/30 transition-colors"
                      >
                        Use
                      </button>
                      <button
                        onClick={() => toggleFavorite(item.id, item.isFavorite)}
                        className={`text-[10px] px-3 py-1 rounded-full transition-colors ${item.isFavorite ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}
                      >
                        {item.isFavorite ? '★' : '☆'}
                      </button>
                      <button
                        onClick={() => deletePrompt(item.id)}
                        className="text-[10px] px-3 py-1 rounded-full bg-red-500/10 text-red-400/50 hover:bg-red-500/20 transition-colors ml-auto opacity-0 group-hover:opacity-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════
// PRESET MANAGER MODAL
// ═══════════════════════════════════════════════════════════════

function PresetModal({
  isOpen,
  onClose,
  onSave,
  onLoad,
  presets
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string) => void
  onLoad: (preset: Preset) => void
  presets: Preset[]
}) {
  const [presetName, setPresetName] = useState('')
  const [activeTab, setActiveTab] = useState<'save' | 'load'>('save')

  if (!isOpen) return null

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed z-[201] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-[400px] glass rounded-3xl p-6 border border-white/5"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 transition-colors">×</button>
        
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('save')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'save' ? 'bg-[#f5c518] text-black' : 'bg-white/5 text-white/50'}`}
          >
            Save Preset
          </button>
          <button
            onClick={() => setActiveTab('load')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'load' ? 'bg-[#f5c518] text-black' : 'bg-white/5 text-white/50'}`}
          >
            Load Preset
          </button>
        </div>

        {activeTab === 'save' ? (
          <div className="space-y-4">
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Preset name (e.g., My Coding Setup)"
              className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#f5c518]/50"
            />
            <button
              onClick={() => {
                if (presetName.trim()) {
                  onSave(presetName.trim())
                  setPresetName('')
                  onClose()
                }
              }}
              disabled={!presetName.trim()}
              className="w-full py-3 rounded-xl font-semibold bg-gradient-gold text-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💾 Save Preset
            </button>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {presets.length === 0 ? (
              <div className="text-center text-white/30 py-8">
                <span className="text-2xl block mb-2">📂</span>
                No saved presets yet
              </div>
            ) : (
              presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    onLoad(preset)
                    onClose()
                  }}
                  className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{preset.name}</span>
                    <span className="text-[10px] text-white/30">{new Date(preset.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                      {preset.config.mode}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                      {Object.values(preset.config.modules).filter(Boolean).length} modules
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </motion.div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// NVIDIA API PANEL
// ═══════════════════════════════════════════════════════════════

function NvidiaPanel({
  isOpen,
  onClose
}: {
  isOpen: boolean
  onClose: () => void
}) {
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
          messages: [{ role: 'user', content: prompt || 'Hello, how are you?' }]
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
      <motion.div
        className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed z-[201] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-[500px] glass rounded-3xl p-6 border border-white/5 max-h-[80vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
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
          {/* Model Selection */}
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Model</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedModel('nvidia/nemotron-3-8b-instruct')}
                className={`p-3 rounded-xl text-left text-sm transition-all ${selectedModel === 'nvidia/nemotron-3-8b-instruct' ? 'bg-[#f5c518]/20 border-[#f5c518]/50 text-white' : 'bg-white/5 border-white/5 text-white/60'} border`}
              >
                <span className="block font-medium">Nemotron 3</span>
                <span className="text-[10px] text-green-400">FREE</span>
              </button>
              <button
                onClick={() => setSelectedModel('meta/llama-4-maverick-17b-128e-instruct')}
                className={`p-3 rounded-xl text-left text-sm transition-all ${selectedModel === 'meta/llama-4-maverick-17b-128e-instruct' ? 'bg-[#f5c518]/20 border-[#f5c518]/50 text-white' : 'bg-white/5 border-white/5 text-white/60'} border`}
              >
                <span className="block font-medium">Llama 4 Maverick</span>
                <span className="text-[10px] text-[#f5c518]">17B</span>
              </button>
            </div>
          </div>

          {/* Prompt Input */}
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Test Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a test prompt..."
              className="w-full h-24 bg-black/50 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#f5c518]/50 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={testApi}
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-semibold bg-gradient-gold text-black disabled:opacity-50"
            >
              {loading ? 'Testing...' : '🧪 Test API'}
            </button>
            <button
              onClick={copyCode}
              className="py-3 px-4 rounded-xl font-medium bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
            >
              {copied ? '✓' : '📋'}
            </button>
          </div>

          {/* Response */}
          {response && (
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Response</label>
              <pre className="bg-black/50 border border-white/10 rounded-xl p-4 text-xs text-white/60 overflow-x-auto max-h-48">
                {response}
              </pre>
            </div>
          )}

          {/* Token Info */}
          <div className="p-4 bg-white/5 rounded-xl">
            <p className="text-xs text-white/40 mb-2">
              <span className="text-[#f5c518]">⚠️</span> Token is embedded in prompt. For production, use environment variable.
            </p>
            <code className="text-[10px] text-white/30 break-all">
              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
            </code>
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
  // Core state
  const [mode, setMode] = useState<'master' | 'glm' | 'concise'>('master')
  const [task, setTask] = useState('')
  
  // UI state
  const [copied, setCopied] = useState(false)
  const [copiedMd, setCopiedMd] = useState(false)
  const [copiedPlain, setCopiedPlain] = useState(false)
  const [saved, setSaved] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [presetModalOpen, setPresetModalOpen] = useState(false)
  const [nvidiaPanelOpen, setNvidiaPanelOpen] = useState(false)
  const [showBuilder, setShowBuilder] = useState(false)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  
  // Modules state - initialized based on mode
  const [modules, setModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    Object.values(PROMPT_MODULES).forEach(m => {
      initial[m.id] = MODE_CONFIGS.master.enabledModules.includes(m.id)
    })
    return initial
  })
  
  // Presets state
  const [presets, setPresets] = useState<Preset[]>([])

  // Load presets from localStorage
  useEffect(() => {
    const savedPresets = localStorage.getItem('marky-presets-v2')
    if (savedPresets) {
      try {
        setPresets(JSON.parse(savedPresets))
      } catch (e) {
        console.error('Failed to load presets:', e)
      }
    }
  }, [])

  // Update modules when mode changes
  useEffect(() => {
    const config = MODE_CONFIGS[mode]
    setModules(prev => {
      const updated = { ...prev }
      // Reset to mode defaults for core modules
      Object.values(PROMPT_MODULES).forEach(m => {
        if (m.category === 'core') {
          updated[m.id] = config.enabledModules.includes(m.id)
        }
      })
      return updated
    })
  }, [mode])

  // Build the prompt dynamically based on modules
  const buildPrompt = useCallback(() => {
    const parts: string[] = []
    
    // Add modules in order
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

  // Token count
  const tokenCount = useMemo(() => estimateTokens(getFinalPrompt()), [getFinalPrompt])
  const charCount = getFinalPrompt().length
  const moduleCount = Object.entries(modules).filter(([id, enabled]) => enabled && PROMPT_MODULES[id]).length

  // Copy functions - NO ALERTS, just visual feedback
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
      
      // Visual feedback only - NO ALERTS
      if (format === 'plain') {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else if (format === 'markdown') {
        setCopiedMd(true)
        setTimeout(() => setCopiedMd(false), 2000)
      } else {
        setCopiedPlain(true)
        setTimeout(() => setCopiedPlain(false), 2000)
      }
    } catch {
      // Silent fail - use textarea fallback
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      
      if (format === 'plain') {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  // Save to database - SILENT
  const savePrompt = async () => {
    try {
      await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          variant: mode,
          tone: null,
          task: task.trim() || null,
          prompt: getFinalPrompt(),
          charCount
        })
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      fetchFavoritesCount()
    } catch (e) {
      console.error('Failed to save:', e)
    }
  }

  // Save preset
  const savePreset = (name: string) => {
    const newPreset: Preset = {
      id: Date.now().toString(),
      name,
      createdAt: new Date().toISOString(),
      config: {
        mode,
        modules: { ...modules },
        task
      }
    }
    const updated = [...presets, newPreset]
    setPresets(updated)
    localStorage.setItem('marky-presets-v2', JSON.stringify(updated))
  }

  // Load preset
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
    } catch (e) {
      console.error('Failed to fetch favorites:', e)
    }
  }, [])

  useEffect(() => {
    fetchFavoritesCount()
  }, [fetchFavoritesCount])

  // URL state management
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlMode = params.get('mode')
    const urlTask = params.get('task')
    
    if (urlMode && ['master', 'glm', 'concise'].includes(urlMode)) {
      setMode(urlMode as typeof mode)
    }
    if (urlTask) setTask(decodeURIComponent(urlTask))
  }, [])

  const selectFromHistory = (record: PromptRecord) => {
    if (record.mode) setMode(record.mode as typeof mode)
    if (record.task) setTask(record.task)
    setHistoryOpen(false)
  }

  const toggleModule = (id: string) => {
    setModules(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white relative noise-overlay">
      <AmbientBackground />
      
      <div className="relative z-10 max-w-md mx-auto px-4 pt-safe-top pb-40">
        {/* Header */}
        <motion.header 
          className="flex items-start justify-between py-5 mb-6 border-b border-white/5 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient-gold relative">
              MARKY
              <span className="absolute inset-0 blur-xl bg-gradient-gold opacity-30 -z-10" />
            </h1>
            <p className="text-[10px] tracking-widest uppercase text-white/40 mt-1 font-medium">
              AI Prompt Builder · v3.5 Master
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNvidiaPanelOpen(true)}
              className="w-9 h-9 rounded-xl bg-[#76b900]/20 border border-[#76b900]/30 flex items-center justify-center text-[#76b900] hover:bg-[#76b900]/30 transition-all"
              title="NVIDIA Build API"
            >
              <span className="text-base">🤖</span>
            </button>
            <button
              onClick={() => setPresetModalOpen(true)}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white/60 transition-all"
              title="Presets"
            >
              <span className="text-base">📂</span>
            </button>
            <button
              onClick={() => setHistoryOpen(true)}
              className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white/60 transition-all"
              title="History"
            >
              <span className="text-base">⏱</span>
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#f5c518] text-black text-[9px] font-bold flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>
            <span className="font-mono text-[9px] text-white/30 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              v3.5
            </span>
          </div>
        </motion.header>

        {/* Build Prompt Button - Entry Point */}
        <AnimatePresence>
          {!showBuilder && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <button
                onClick={() => setShowBuilder(true)}
                className="w-full glass rounded-2xl p-6 text-left hover:bg-white/[0.07] transition-all group relative overflow-hidden"
              >
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
              
              {/* Quick Stats */}
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Collapse Button */}
              <button
                onClick={() => setShowBuilder(false)}
                className="w-full mb-4 py-2 text-center text-xs text-white/40 hover:text-white/60 transition-colors"
              >
                ↑ Collapse Builder
              </button>

              {/* Task Section */}
              <motion.section 
                className="mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="glass rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-gold" />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold tracking-widest uppercase text-[#f5c518]">
                      What's your task?
                    </span>
                    <span className="text-[9px] tracking-widest uppercase text-white/30 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                      Optional
                    </span>
                  </div>
                  <textarea
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="Type your task here...&#10;&#10;e.g. Build a landing page for my SaaS"
                    className="w-full min-h-[100px] bg-black/50 border border-white/5 rounded-xl p-4 text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-[#f5c518]/50 focus:ring-2 focus:ring-[#f5c518]/20 transition-all font-sans"
                  />
                </div>
              </motion.section>

              {/* Mode Section - Interactive Cards */}
              <motion.section 
                className="mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <p className="text-[10px] tracking-widest uppercase text-white/40 mb-3 flex items-center gap-2">
                  <span className="w-4 h-px bg-white/10" />
                  Mode
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(MODE_CONFIGS).map(([id, config]) => (
                    <div
                      key={id}
                      className="relative"
                      onMouseEnter={() => setHoveredCard(`mode-${id}`)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <button
                        onClick={() => setMode(id as typeof mode)}
                        className={`relative w-full p-4 rounded-2xl text-center transition-all duration-300 ${
                          mode === id ? 'bg-white/10 border-[#f5c518]/50' : 'bg-white/5 border-white/5 hover:bg-white/[0.07] active:scale-95'
                        } border`}
                      >
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-gold transform origin-left transition-transform duration-300" 
                          style={{ transform: mode === id ? 'scaleX(1)' : 'scaleX(0)' }} 
                        />
                        <span className={`text-2xl font-bold block mb-1 transition-all ${mode === id ? 'text-[#f5c518] glow-gold-text' : 'text-white/30'}`}>
                          {config.number}
                        </span>
                        <span className="text-[9px] tracking-widest uppercase text-white/40">{config.label}</span>
                        {/* Silent checkmark for active mode - NO POPUP */}
                        {mode === id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#22c55e] flex items-center justify-center"
                          >
                            <span className="text-xs text-black">✓</span>
                          </motion.div>
                        )}
                      </button>
                      
                      {/* Hover Preview */}
                      <AnimatePresence>
                        {hoveredCard === `mode-${id}` && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute z-10 top-full left-0 right-0 mt-2 p-3 glass rounded-xl text-[11px] text-white/60"
                          >
                            <span className="text-[9px] text-[#ff6b35] uppercase tracking-wide">{config.tag}</span>
                            <p className="mt-1">{config.preview}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* Modules Section - Toggleable */}
              <motion.section 
                className="mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <p className="text-[10px] tracking-widest uppercase text-white/40 mb-3 flex items-center gap-2">
                  <span className="w-4 h-px bg-white/10" />
                  Modules · Toggle to customize
                </p>
                
                {/* Core Modules */}
                <div className="space-y-2 mb-4">
                  <p className="text-[9px] text-white/30 uppercase tracking-wide">Core</p>
                  {Object.values(PROMPT_MODULES)
                    .filter(m => m.category === 'core')
                    .map((mod) => (
                      <button
                        key={mod.id}
                        onClick={() => toggleModule(mod.id)}
                        className={`w-full p-4 rounded-xl text-left transition-all duration-300 flex items-center gap-4 ${
                          modules[mod.id] 
                            ? 'bg-white/10 border-[#f5c518]/30' 
                            : 'bg-white/5 border-white/5 hover:bg-white/[0.07]'
                        } border`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          modules[mod.id] 
                            ? 'bg-[#f5c518] border-[#f5c518]' 
                            : 'border-white/20'
                        }`}>
                          {modules[mod.id] && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-black text-xs"
                            >
                              ✓
                            </motion.span>
                          )}
                        </div>
                        <div className="flex-1">
                          <span className={`text-sm font-medium block ${modules[mod.id] ? 'text-white' : 'text-white/50'}`}>
                            {mod.label}
                          </span>
                          <span className="text-[10px] text-white/30">{mod.description}</span>
                        </div>
                      </button>
                    ))}
                </div>
                
                {/* Add-on Modules */}
                <div className="space-y-2 mb-4">
                  <p className="text-[9px] text-white/30 uppercase tracking-wide">Add-ons</p>
                  {Object.values(PROMPT_MODULES)
                    .filter(m => m.category === 'addon')
                    .map((mod) => (
                      <button
                        key={mod.id}
                        onClick={() => toggleModule(mod.id)}
                        className={`w-full p-4 rounded-xl text-left transition-all duration-300 flex items-center gap-4 ${
                          modules[mod.id] 
                            ? 'bg-white/10 border-[#ff6b35]/30' 
                            : 'bg-white/5 border-white/5 hover:bg-white/[0.07]'
                        } border`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          modules[mod.id] 
                            ? 'bg-[#ff6b35] border-[#ff6b35]' 
                            : 'border-white/20'
                        }`}>
                          {modules[mod.id] && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-black text-xs"
                            >
                              ✓
                            </motion.span>
                          )}
                        </div>
                        <div className="flex-1">
                          <span className={`text-sm font-medium block ${modules[mod.id] ? 'text-white' : 'text-white/50'}`}>
                            {mod.label}
                          </span>
                          <span className="text-[10px] text-white/30">{mod.description}</span>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#ff6b35]/20 text-[#ff6b35]">
                          ADD-ON
                        </span>
                      </button>
                    ))}
                </div>
                
                {/* Skill Modules */}
                <div className="space-y-2">
                  <p className="text-[9px] text-white/30 uppercase tracking-wide">Skills</p>
                  {Object.values(PROMPT_MODULES)
                    .filter(m => m.category === 'skill')
                    .map((mod) => (
                      <button
                        key={mod.id}
                        onClick={() => toggleModule(mod.id)}
                        className={`w-full p-4 rounded-xl text-left transition-all duration-300 flex items-center gap-4 ${
                          modules[mod.id] 
                            ? 'bg-white/10 border-[#76b900]/30' 
                            : 'bg-white/5 border-white/5 hover:bg-white/[0.07]'
                        } border`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          modules[mod.id] 
                            ? 'bg-[#76b900] border-[#76b900]' 
                            : 'border-white/20'
                        }`}>
                          {modules[mod.id] && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-black text-xs"
                            >
                              ✓
                            </motion.span>
                          )}
                        </div>
                        <div className="flex-1">
                          <span className={`text-sm font-medium block ${modules[mod.id] ? 'text-white' : 'text-white/50'}`}>
                            {mod.label}
                          </span>
                          <span className="text-[10px] text-white/30">{mod.description}</span>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#76b900]/20 text-[#76b900]">
                          SKILL
                        </span>
                      </button>
                    ))}
                </div>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Output Section - Always Visible */}
        <motion.section 
          className="mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.07]:bg-white/5 border-white/5 hover:bg-white/[0.07]'
                        } border`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          modules[mod.id] 
                            ? 'bg-[#76b900] border-[#76b900]' 
                            : 'border-white/20'
                        }`}>
                          {modules[mod.id] && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-black text-xs"
                            >
                              ✓
                            </motion.span>
                          )}
                        </div>
                        <div className="flex-1">
                          <span className={`text-sm font-medium block ${modules[mod.id] ? 'text-white' : 'text-white/50'}`}>
                            {mod.label}
                          </span>
                          <span className="text-[10px] text-white/30">{mod.description}</span>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#76b900]/20 text-[#76b900]">
                          SKILL
                        </span>
                      </button>
                    ))}
                </div>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Output Section - Always Visible */}
        <motion.section 
          className="mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] tracking-widest uppercase text-white/40 flex items-center gap-2">
              <span className="w-4 h-px bg-white/10" />
              Prompt Preview
            </p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#f5c518] bg-[#f5c518]/10 px-2 py-1 rounded-full">
                ~{tokenCount} tokens
              </span>
              <span className="font-mono text-[10px] text-white/30 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                {charCount.toLocaleString()} chars
              </span>
            </div>
          </div>
          <div className="glass rounded-2xl p-5">
            <pre className="font-mono text-[11px] leading-relaxed text-white/60 whitespace-pre-wrap break-words max-h-[250px] overflow-y-auto">
              {buildPrompt()}
            </pre>
          </div>
        </motion.section>

        {/* Tips */}
        <motion.section 
          className="pt-6 border-t border-white/5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-[10px] tracking-widest uppercase text-white/40 mb-3 flex items-center gap-2">
            <span className="w-4 h-px bg-white/10" />
            Quick Reference
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Master', text: 'Full system prompt' },
              { label: 'GLM', text: 'Optimized for GLM' },
              { label: 'Concise', text: 'Minimal tokens' }
            ].map((tip, i) => (
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
          {/* Secondary Actions Row */}
          <div className="flex gap-2 mb-3">
            <motion.button
              onClick={() => copyToClipboard('plain')}
              className="flex-1 py-2.5 rounded-xl font-medium text-xs transition-all duration-300 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
              whileTap={{ scale: 0.98 }}
            >
              {copiedPlain ? '✓ Copied!' : '📄 Plain Text'}
            </motion.button>
            <motion.button
              onClick={() => copyToClipboard('markdown')}
              className="flex-1 py-2.5 rounded-xl font-medium text-xs transition-all duration-300 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
              whileTap={{ scale: 0.98 }}
            >
              {copiedMd ? '✓ Copied!' : '📋 Markdown'}
            </motion.button>
            <motion.button
              onClick={() => copyToClipboard('url')}
              className="flex-1 py-2.5 rounded-xl font-medium text-xs transition-all duration-300 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
              whileTap={{ scale: 0.98 }}
            >
              🔗 URL
            </motion.button>
            <motion.button
              onClick={savePrompt}
              className="flex-1 py-2.5 rounded-xl font-medium text-xs transition-all duration-300 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
              whileTap={{ scale: 0.98 }}
            >
              {saved ? '✓ Saved!' : '☆ Save'}
            </motion.button>
          </div>
          
          {/* Primary Action */}
          <motion.button
            onClick={() => copyToClipboard('plain')}
            className={`w-full py-4 rounded-2xl font-semibold text-base tracking-wide relative overflow-hidden transition-all duration-300 ${
              copied ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-gold'
            } text-black`}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="text-lg">{copied ? '✓' : '⎘'}</span>
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Prompt'}</span>
            </span>
          </motion.button>
        </div>
      </div>

      {/* History Panel */}
      <HistoryPanel
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelect={selectFromHistory}
        onRefresh={fetchFavoritesCount}
      />

      {/* Preset Modal */}
      <AnimatePresence>
        {presetModalOpen && (
          <PresetModal
              isOpen={presetModalOpen}
              onClose={() => setPresetModalOpen(false)}
              onSave={savePreset}
              onLoad={loadPreset}
              presets={presets}
            />
          )}
          {nvidiaPanelOpen && (
            <NvidiaPanel
              isOpen={nvidiaPanelOpen}
              onClose={() => setNvidiaPanelOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
