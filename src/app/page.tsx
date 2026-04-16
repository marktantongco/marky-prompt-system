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
}

interface Preset {
  id: string
  name: string
  createdAt: string
  config: {
    mode: 'base' | 'copy'
    variant: 'master' | 'glm' | 'concise'
    tone: 'faith' | 'insurance' | 'personal'
    modules: Record<string, boolean>
    task: string
  }
}

// ═══════════════════════════════════════════════════════════════
// PROMPT MODULES - Modular System
// ═══════════════════════════════════════════════════════════════

const PROMPT_MODULES: Record<string, ModuleConfig> = {
  role: {
    id: 'role',
    label: 'Role Definition',
    description: 'Who the AI acts as',
    enabled: true,
    content: `You are my expert AI assistant, business partner, and creative strategist.
Your job: give me what I truly need — not just what I asked for.`
  },
  coreRules: {
    id: 'coreRules',
    label: 'Core Rules',
    description: '10 fundamental operating principles',
    enabled: true,
    content: `OPERATING PRINCIPLES:
1. Zero fluff. Every word earns its place.
2. Code must be complete and runnable — never pseudocode or placeholders.
3. When I have multiple options, rank by impact. Highest first.
4. If a better or faster approach exists, name it — even if I didn't ask.
5. Default to expert level. Adjust only if I say otherwise.
6. Vague request? State your assumption clearly, then proceed.
7. Spot a risk? Name it in one sentence, then give me the best path forward.
8. Never ask me to repeat context already in this conversation.
9. Format for fast scanning: headers, bullets, bold key terms.
10. End every complex answer with ⚡ Next Step.`
  },
  advocacy: {
    id: 'advocacy',
    label: 'Advocacy Mode',
    description: 'AI acts as your advocate',
    enabled: true,
    content: `ADVOCATE FOR ME:
- Flag mistakes before I make them.
- Push back if my request works against my long-term goals.
- Always optimize for lasting success — not just the immediate task.`
  },
  writingStyle: {
    id: 'writingStyle',
    label: 'Writing Style',
    description: 'Voice and tone guidelines',
    enabled: true,
    content: `MY WRITING VOICE (mirror this in all outputs):
- Short sentences. One idea each.
- Plain language. Anyone can understand it.
- Direct and personal — like writing to one person.
- Vary sentence rhythm. Short punches. Then a slightly longer one for flow.`
  },
  skills: {
    id: 'skills',
    label: 'Skills Library',
    description: 'External skill references',
    enabled: true,
    content: `SKILLS — FETCH CONTENT BEFORE USING:
- GSAP animations → https://raw.githubusercontent.com/xerxes-on/gsap-animation-skill/main/gsap-animations.md
- Photography / AI image prompts → https://marktantongco.github.io/aiskills-photog/skills.md
- Vercel / deployment → https://skills.sh/`
  },
  codeMode: {
    id: 'codeMode',
    label: '+Code Module',
    description: 'Enhanced coding rules',
    enabled: false,
    content: `CODE MODE: ON
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
    content: `DESIGN MODE: ON
- Use Tailwind CSS for styling
- Mobile-first responsive design
- WCAG AA accessibility minimum
- 60fps animation budget
- Semantic HTML structure
- Support dark mode by default`
  },
  copyMode: {
    id: 'copyMode',
    label: '+Copywriting Module',
    description: 'Copywriting frameworks',
    enabled: false,
    content: `COPYWRITING MODE: ON
- Lead with emotion. Logic closes. Emotion opens.
- Open with the problem, not the product.
- One big idea per piece. No cramming.
- Use "you" more than "I" or "we."
- Make the CTA feel like relief — not pressure.`
  }
}

const COPY_TONE_MODULES: Record<string, { prefix: string; tone: string; rules: string }> = {
  faith: {
    prefix: 'COPYWRITING MODE: ON',
    tone: 'TONE: Faith & Empowerment — warm, conviction-driven, hopeful.',
    rules: `BEFORE writing, answer these internally:
- What's the #1 thing my audience wants right now?
- What keeps them up at night?
- What will they feel when this problem is solved?
- What happens if they don't act?`
  },
  insurance: {
    prefix: 'COPYWRITING MODE: ON',
    tone: 'TONE: Insurance Sales — trust-first, calm urgency, protective. IC Philippines compliant.',
    rules: `COPY RULES:
- Never make specific financial promises or guarantees.
- Always position protection as care — not fear-mongering.
- Build trust through transparency.`
  },
  personal: {
    prefix: 'COPYWRITING MODE: ON',
    tone: 'TONE: Personal Brand — direct, honest, story-led. LinkedIn & thought leadership.',
    rules: `COPY RULES:
- Be vulnerable — share the lesson, not just the win.
- Specific beats generic. Numbers, dates, names win.
- Connect the personal to the universal.`
  }
}

const MODE_CARDS = [
  { id: 'master', number: '1', label: 'Master', emoji: '⚡', tag: 'Most Explicit', preview: 'Full structured ruleset with every instruction clearly labelled.' },
  { id: 'glm', number: '2', label: 'GLM Native', emoji: '🧠', tag: 'Most Natural', preview: 'Optimized for GLM\'s reasoning architecture.' },
  { id: 'concise', number: '3', label: 'Concise', emoji: '🚀', tag: 'Fastest', preview: 'Stripped to essentials. Shortest token count.' }
]

const TONE_CARDS = [
  { id: 'faith', emoji: '🙏', label: 'Faith', tag: '@markytanky', preview: 'Warm. Conviction-driven. Hopeful.' },
  { id: 'insurance', emoji: '🛡️', label: 'Insurance', tag: 'Pacific Cross', preview: 'Trust-first. Calm urgency. Protective.' },
  { id: 'personal', emoji: '🎯', label: 'Brand', tag: 'LinkedIn', preview: 'Direct. Honest. Story-led.' }
]

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
                          {item.mode === 'base' ? '⚡' : '✍️'} {item.variant || item.tone}
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
                      {preset.config.mode === 'base' ? '⚡' : '✍️'} {preset.config.variant || preset.config.tone}
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
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function MarkyPromptBuilder() {
  // Core state
  const [mode, setMode] = useState<'base' | 'copy'>('base')
  const [variant, setVariant] = useState<'master' | 'glm' | 'concise'>('master')
  const [tone, setTone] = useState<'faith' | 'insurance' | 'personal'>('faith')
  const [task, setTask] = useState('')
  
  // UI state
  const [copied, setCopied] = useState(false)
  const [copiedMd, setCopiedMd] = useState(false)
  const [saved, setSaved] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [presetModalOpen, setPresetModalOpen] = useState(false)
  const [showBuilder, setShowBuilder] = useState(false)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  
  // Modules state
  const [modules, setModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    Object.values(PROMPT_MODULES).forEach(m => {
      initial[m.id] = m.enabled
    })
    return initial
  })
  
  // Presets state
  const [presets, setPresets] = useState<Preset[]>([])

  // Load presets from localStorage
  useEffect(() => {
    const savedPresets = localStorage.getItem('marky-presets')
    if (savedPresets) {
      try {
        setPresets(JSON.parse(savedPresets))
      } catch (e) {
        console.error('Failed to load presets:', e)
      }
    }
  }, [])

  // Build the prompt dynamically based on modules
  const buildPrompt = useCallback(() => {
    const parts: string[] = []
    
    // For copy mode, use the tone-specific content
    if (mode === 'copy') {
      const toneData = COPY_TONE_MODULES[tone]
      
      if (modules.role) {
        parts.push(PROMPT_MODULES.role.content)
      }
      
      parts.push('')
      parts.push(toneData.prefix)
      parts.push(toneData.tone)
      parts.push('')
      parts.push(toneData.rules)
      
      if (modules.copyMode) {
        parts.push('')
        parts.push(PROMPT_MODULES.copyMode.content)
      }
    } else {
      // Base mode - assemble from modules
      if (modules.role) parts.push(PROMPT_MODULES.role.content)
      if (modules.coreRules) {
        parts.push('')
        parts.push(PROMPT_MODULES.coreRules.content)
      }
      if (modules.advocacy) {
        parts.push('')
        parts.push(PROMPT_MODULES.advocacy.content)
      }
      if (modules.writingStyle) {
        parts.push('')
        parts.push(PROMPT_MODULES.writingStyle.content)
      }
      if (modules.skills) {
        parts.push('')
        parts.push(PROMPT_MODULES.skills.content)
      }
      if (modules.codeMode) {
        parts.push('')
        parts.push(PROMPT_MODULES.codeMode.content)
      }
      if (modules.designMode) {
        parts.push('')
        parts.push(PROMPT_MODULES.designMode.content)
      }
    }
    
    return parts.join('\n')
  }, [mode, tone, modules])

  const getFinalPrompt = useCallback(() => {
    const base = buildPrompt()
    return task.trim() ? `${base}\n\n---\n\nMY TASK:\n${task.trim()}` : base
  }, [buildPrompt, task])

  // Token count
  const tokenCount = useMemo(() => estimateTokens(getFinalPrompt()), [getFinalPrompt])
  const charCount = getFinalPrompt().length

  // Copy functions
  const copyToClipboard = async (asMarkdown: boolean = false) => {
    const text = asMarkdown 
      ? `\`\`\`\n${getFinalPrompt()}\n\`\`\``
      : getFinalPrompt()
    
    try {
      await navigator.clipboard.writeText(text)
      if (asMarkdown) {
        setCopiedMd(true)
        setTimeout(() => setCopiedMd(false), 2000)
      } else {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      if (asMarkdown) {
        setCopiedMd(true)
        setTimeout(() => setCopiedMd(false), 2000)
      } else {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  // Copy URL with state
  const copyUrlToClipboard = async () => {
    const params = new URLSearchParams()
    params.set('mode', mode)
    if (mode === 'base') {
      params.set('variant', variant)
    } else {
      params.set('tone', tone)
    }
    if (task) params.set('task', encodeURIComponent(task))
    
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`
    
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error('Failed to copy URL')
    }
  }

  // Save to database
  const savePrompt = async () => {
    try {
      await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          variant: mode === 'base' ? variant : null,
          tone: mode === 'copy' ? tone : null,
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
        variant,
        tone,
        modules: { ...modules },
        task
      }
    }
    const updated = [...presets, newPreset]
    setPresets(updated)
    localStorage.setItem('marky-presets', JSON.stringify(updated))
  }

  // Load preset
  const loadPreset = (preset: Preset) => {
    setMode(preset.config.mode)
    setVariant(preset.config.variant)
    setTone(preset.config.tone)
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
    const urlVariant = params.get('variant')
    const urlTone = params.get('tone')
    const urlTask = params.get('task')
    
    if (urlMode === 'base' || urlMode === 'copy') setMode(urlMode)
    if (urlVariant && ['master', 'glm', 'concise'].includes(urlVariant)) setVariant(urlVariant as typeof variant)
    if (urlTone && ['faith', 'insurance', 'personal'].includes(urlTone)) setTone(urlTone as typeof tone)
    if (urlTask) setTask(decodeURIComponent(urlTask))
  }, [])

  const selectFromHistory = (record: PromptRecord) => {
    setMode(record.mode as 'base' | 'copy')
    if (record.variant) setVariant(record.variant as 'master' | 'glm' | 'concise')
    if (record.tone) setTone(record.tone as 'faith' | 'insurance' | 'personal')
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
              AI Prompt Builder · GLM
            </p>
          </div>
          <div className="flex items-center gap-2">
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
              v3.4
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
                    <span className="text-sm text-white/40">Configure modules, modes, and presets</span>
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
                  <span className="text-xl font-bold text-white">{Object.values(modules).filter(Boolean).length}</span>
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
                    placeholder="Type your task here...&#10;&#10;e.g. Write a caption for my Pacific Cross post"
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
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'base', emoji: '⚡', label: 'Base Mode', desc: 'Strategy · Code · Research' },
                    { id: 'copy', emoji: '✍️', label: 'Copywriting', desc: 'Captions · Emails · Sales' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id as 'base' | 'copy')}
                      className={`relative p-5 rounded-2xl text-left overflow-hidden transition-all duration-300 ${
                        mode === m.id ? 'bg-white/10 border-[#f5c518]/50' : 'bg-white/5 border-white/5 hover:bg-white/[0.07]'
                      } border`}
                    >
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-gold transform origin-left transition-transform duration-300" 
                        style={{ transform: mode === m.id ? 'scaleX(1)' : 'scaleX(0)' }} 
                      />
                      <span className="text-xl block mb-2">{m.emoji}</span>
                      <span className="text-sm font-semibold block mb-1">{m.label}</span>
                      <span className="text-[11px] text-white/40">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </motion.section>

              {/* Variant/Tone Section - Interactive Cards with Hover Preview */}
              <AnimatePresence mode="wait">
                {mode === 'base' ? (
                  <motion.section 
                    key="variant"
                    className="mb-6"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-[10px] tracking-widest uppercase text-white/40 mb-3 flex items-center gap-2">
                      <span className="w-4 h-px bg-white/10" />
                      Variant
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {MODE_CARDS.map((v) => (
                        <div
                          key={v.id}
                          className="relative"
                          onMouseEnter={() => setHoveredCard(`variant-${v.id}`)}
                          onMouseLeave={() => setHoveredCard(null)}
                        >
                          <button
                            onClick={() => setVariant(v.id as typeof variant)}
                            className={`relative w-full p-4 rounded-2xl text-center transition-all duration-300 ${
                              variant === v.id ? 'bg-white/10 border-[#f5c518]/50' : 'bg-white/5 border-white/5 hover:bg-white/[0.07] active:scale-95'
                            } border`}
                          >
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-gold transform origin-left transition-transform duration-300" 
                              style={{ transform: variant === v.id ? 'scaleX(1)' : 'scaleX(0)' }} 
                            />
                            <span className={`text-2xl font-bold block mb-1 transition-all ${variant === v.id ? 'text-[#f5c518] glow-gold-text' : 'text-white/30'}`}>
                              {v.number}
                            </span>
                            <span className="text-[9px] tracking-widest uppercase text-white/40">{v.label}</span>
                          </button>
                          
                          {/* Hover Preview */}
                          <AnimatePresence>
                            {hoveredCard === `variant-${v.id}` && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute z-10 top-full left-0 right-0 mt-2 p-3 glass rounded-xl text-[11px] text-white/60"
                              >
                                <span className="text-[9px] text-[#ff6b35] uppercase tracking-wide">{v.tag}</span>
                                <p className="mt-1">{v.preview}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </motion.section>
                ) : (
                  <motion.section 
                    key="tone"
                    className="mb-6"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-[10px] tracking-widest uppercase text-white/40 mb-3 flex items-center gap-2">
                      <span className="w-4 h-px bg-white/10" />
                      Tone
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {TONE_CARDS.map((t) => (
                        <div
                          key={t.id}
                          className="relative"
                          onMouseEnter={() => setHoveredCard(`tone-${t.id}`)}
                          onMouseLeave={() => setHoveredCard(null)}
                        >
                          <button
                            onClick={() => setTone(t.id as typeof tone)}
                            className={`relative w-full p-4 rounded-2xl text-center transition-all duration-300 ${
                              tone === t.id ? 'bg-white/10 border-[#f5c518]/50' : 'bg-white/5 border-white/5 hover:bg-white/[0.07] active:scale-95'
                            } border`}
                          >
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-gold transform origin-left transition-transform duration-300" 
                              style={{ transform: tone === t.id ? 'scaleX(1)' : 'scaleX(0)' }} 
                            />
                            <span className="text-2xl block mb-1">{t.emoji}</span>
                            <span className="text-[9px] tracking-widest uppercase text-white/40">{t.label}</span>
                          </button>
                          
                          <AnimatePresence>
                            {hoveredCard === `tone-${t.id}` && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute z-10 top-full left-0 right-0 mt-2 p-3 glass rounded-xl text-[11px] text-white/60"
                              >
                                <span className="text-[9px] text-[#ff6b35] uppercase tracking-wide">{t.tag}</span>
                                <p className="mt-1">{t.preview}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>

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
                <div className="space-y-2">
                  {Object.values(PROMPT_MODULES).map((mod) => (
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
                      {mod.id.startsWith('+') && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#ff6b35]/20 text-[#ff6b35]">
                          ADD-ON
                        </span>
                      )}
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
            <pre className="font-mono text-[11px] leading-relaxed text-white/60 whitespace-pre-wrap break-words max-h-[200px] overflow-y-auto">
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
              { label: 'Base Mode', text: 'Code · Strategy · Research' },
              { label: 'Copywriting', text: 'Captions · Emails · Sales' },
              { label: 'Pro Tip', text: 'Paste at top of GLM chat' }
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
              onClick={() => copyToClipboard(true)}
              className="flex-1 py-2.5 rounded-xl font-medium text-xs transition-all duration-300 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
              whileTap={{ scale: 0.98 }}
            >
              {copiedMd ? '✓ Copied MD!' : '📋 Markdown'}
            </motion.button>
            <motion.button
              onClick={copyUrlToClipboard}
              className="flex-1 py-2.5 rounded-xl font-medium text-xs transition-all duration-300 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
              whileTap={{ scale: 0.98 }}
            >
              🔗 Copy URL
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
            onClick={() => copyToClipboard(false)}
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
      </AnimatePresence>
    </div>
  )
}
