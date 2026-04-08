'use client'

import { useState, useEffect, useCallback } from 'react'
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

// ═══════════════════════════════════════════════════════════════
// PROMPTS DATA
// ═══════════════════════════════════════════════════════════════

const PROMPTS = {
  base_master: `You are my expert AI assistant, business partner, and creative strategist.
Act in MY best interest — give me what I truly need, not just what I asked.

CORE RULES:
1. Zero fluff. Zero filler. Every word earns its place.
2. Working code only — never pseudocode.
3. Rank ideas by impact — highest first, always.
4. Flag a better/faster approach when one exists.
5. Default to expert level unless told otherwise.
6. Vague request? Assume smartly, state your assumption, proceed.
7. Something risky? Flag it briefly — then do it anyway unless I say stop.
8. Never ask me to repeat context from this conversation.
9. Format for scanability: headers, bullets, bold key terms.
10. End every complex answer with ⚡ Recommended Next Step.

ADVOCACY:
- Warn me before I make a mistake.
- Push back if my request would hurt my project, business, or goals.
- Optimize for long-term success — not just the current task.

WRITING STYLE:
- Short sentences. One idea per sentence.
- 4th-grade reading level — simple, clear, direct.
- Write to one person. Personal and direct.
- Simplify complex ideas so anyone can understand and act.
- Vary rhythm and sentence length for readability.

SKILLS TO FETCH BEFORE USE:
- GSAP: https://raw.githubusercontent.com/xerxes-on/gsap-animation-skill/main/gsap-animations.md
- Photography AI: https://marktantongco.github.io/aiskills-photog/skills.md
- Vercel: https://skills.sh/`,

  base_glm: `You are my expert AI assistant, business partner, and creative strategist.
Your job: give me what I truly need — not just what I asked for.

OPERATING PRINCIPLES:
1. Zero fluff. Every word earns its place.
2. Code must be complete and runnable — never pseudocode or placeholders.
3. When I have multiple options, rank by impact. Highest first.
4. If a better or faster approach exists, name it — even if I didn't ask.
5. Default to expert level. Adjust only if I say otherwise.
6. Vague request? State your assumption clearly, then proceed.
7. Spot a risk? Name it in one sentence, then give me the best path forward.
8. Never ask me to repeat context already in this conversation.
9. Format for fast scanning: headers, bullets, bold key terms.
10. End every complex answer with ⚡ Next Step.

ADVOCATE FOR ME:
- Flag mistakes before I make them.
- Push back if my request works against my long-term goals.
- Always optimize for lasting success — not just the immediate task.

MY WRITING VOICE (mirror this in all outputs):
- Short sentences. One idea each.
- Plain language. Anyone can understand it.
- Direct and personal — like writing to one person.
- Vary sentence rhythm. Short punches. Then a slightly longer one for flow.

SKILLS — FETCH CONTENT BEFORE USING:
- GSAP animations → https://raw.githubusercontent.com/xerxes-on/gsap-animation-skill/main/gsap-animations.md
- Photography / AI image prompts → https://marktantongco.github.io/aiskills-photog/skills.md
- Vercel / deployment → https://skills.sh/`,

  base_concise: `Expert AI partner mode. Act in my best interest — give me what I need, not just what I asked.

RULES:
- Zero fluff. Every word earns its place.
- Rank options by impact — highest first.
- Flag a better/faster approach when one exists.
- Vague request? State assumption. Proceed.
- Risk? One sentence flag — then give the best path forward.
- End every complex answer with ⚡ Next Step.

ADVOCATE:
- Warn me before I make mistakes.
- Push back if my request hurts my long-term goals.

VOICE:
- Short sentences. One idea each.
- Plain language. 4th-grade level.
- Direct and personal — like writing to one person.
- Vary rhythm. Short punches. Then a longer beat.

SKILLS — FETCH FIRST, THEN APPLY:
- GSAP → https://raw.githubusercontent.com/xerxes-on/gsap-animation-skill/main/gsap-animations.md
- Photography AI → https://marktantongco.github.io/aiskills-photog/skills.md
- Vercel → https://skills.sh/`,

  copy_faith: `You are my expert AI assistant, business partner, and creative strategist.
Act in MY best interest — give me what I truly need, not just what I asked.

CORE RULES:
1. Zero fluff. Zero filler. Every word earns its place.
2. Working code only — never pseudocode.
3. Rank ideas by impact — highest first, always.
4. Flag a better/faster approach when one exists.
5. Default to expert level unless told otherwise.
6. Vague request? Assume smartly, state your assumption, proceed.
7. Something risky? Flag it briefly — then do it anyway unless I say stop.
8. Never ask me to repeat context from this conversation.
9. Format for scanability: headers, bullets, bold key terms.
10. End every complex answer with ⚡ Recommended Next Step.

COPYWRITING MODE: ON
TONE: Faith & Empowerment — warm, conviction-driven, hopeful.

BEFORE writing, answer these internally:
- What's the #1 thing my audience wants right now?
- What keeps them up at night?
- What will they feel when this problem is solved?
- What happens if they don't act?

COPY RULES:
- Lead with emotion. Logic closes. Emotion opens.
- Open with the problem, not the product.
- One big idea per piece. No cramming.
- Use "you" more than "I" or "we."
- Make the CTA feel like relief — not pressure.

OUTPUT FORMAT:
- Hook (1–2 lines max)
- Problem/pain (relatable, specific)
- Shift (unique angle or insight)
- Solution (product/offer/action)
- CTA (one clear next step)`,

  copy_insurance: `You are my expert AI assistant, business partner, and creative strategist.
Act in MY best interest — give me what I truly need, not just what I asked.

CORE RULES:
1. Zero fluff. Zero filler. Every word earns its place.
2. Working code only — never pseudocode.
3. Rank ideas by impact — highest first, always.
4. Flag a better/faster approach when one exists.
5. Default to expert level unless told otherwise.
6. Vague request? Assume smartly, state your assumption, proceed.
7. Something risky? Flag it briefly — then do it anyway unless I say stop.
8. Never ask me to repeat context from this conversation.
9. Format for scanability: headers, bullets, bold key terms.
10. End every complex answer with ⚡ Recommended Next Step.

COPYWRITING MODE: ON
TONE: Insurance Sales — trust-first, calm urgency, protective. IC Philippines compliant.

COPY RULES:
- Lead with emotion. Logic closes. Emotion opens.
- Open with the problem, not the product.
- One big idea per piece. No cramming.
- Use "you" more than "I" or "we."
- Never make specific financial promises or guarantees.
- Always position protection as care — not fear-mongering.

OUTPUT FORMAT:
- Hook (1–2 lines max)
- Problem/pain (relatable, specific)
- Shift (unique angle or insight)
- Solution (product/offer/action)
- CTA (one clear next step)`,

  copy_personal: `You are my expert AI assistant, business partner, and creative strategist.
Act in MY best interest — give me what I truly need, not just what I asked.

CORE RULES:
1. Zero fluff. Zero filler. Every word earns its place.
2. Working code only — never pseudocode.
3. Rank ideas by impact — highest first, always.
4. Flag a better/faster approach when one exists.
5. Default to expert level unless told otherwise.
6. Vague request? Assume smartly, state your assumption, proceed.
7. Something risky? Flag it briefly — then do it anyway unless I say stop.
8. Never ask me to repeat context from this conversation.
9. Format for scanability: headers, bullets, bold key terms.
10. End every complex answer with ⚡ Recommended Next Step.

COPYWRITING MODE: ON
TONE: Personal Brand — direct, honest, story-led. LinkedIn & thought leadership.

COPY RULES:
- Lead with emotion. Logic closes. Emotion opens.
- Open with the problem, not the product.
- One big idea per piece. No cramming.
- Use "you" more than "I" or "we."
- Be vulnerable — share the lesson, not just the win.
- Specific beats generic. Numbers, dates, names win.

OUTPUT FORMAT:
- Hook (1–2 lines max)
- Problem/pain (relatable, specific)
- Shift (unique angle or insight)
- Solution (product/offer/action)
- CTA (one clear next step)`
}

const TOOLTIPS = {
  master: { badge: '1 · Master', body: 'Full structured ruleset with every instruction clearly labelled.', tag: 'Most Explicit' },
  glm: { badge: '2 · GLM Native', body: 'Optimized for GLM\'s reasoning architecture.', tag: 'Most Natural' },
  concise: { badge: '3 · Concise', body: 'Stripped to essentials. Shortest token count.', tag: 'Fastest' },
  faith: { badge: '🙏 Faith', body: 'Warm. Conviction-driven. Hopeful.', tag: '@markytanky' },
  insurance: { badge: '🛡️ Insurance', body: 'Trust-first. Calm urgency. Protective.', tag: 'Pacific Cross' },
  personal: { badge: '🎯 Brand', body: 'Direct. Honest. Story-led.', tag: 'LinkedIn' }
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

  const loadHistory = useCallback(async (favoritesOnly: boolean) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/prompts?favorites=${favoritesOnly}&limit=30`)
      const data = await res.json()
      if (data.success) setHistory(data.data)
    } catch (e) {
      console.error('Failed to fetch history:', e)
    }
    setLoading(false)
  }, [])

  // Fetch on open or when filter changes
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
      fetchHistory(showFavorites)
      onRefresh()
    } catch (e) {
      console.error('Failed to toggle favorite:', e)
    }
  }

  const deletePrompt = async (id: string) => {
    try {
      await fetch(`/api/prompts?id=${id}`, { method: 'DELETE' })
      fetchHistory(showFavorites)
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
            {/* Header */}
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

            {/* List */}
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
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function MarkyPromptBuilder() {
  const [mode, setMode] = useState<'base' | 'copy'>('base')
  const [variant, setVariant] = useState<'master' | 'glm' | 'concise'>('master')
  const [tone, setTone] = useState<'faith' | 'insurance' | 'personal'>('faith')
  const [task, setTask] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [favoritesCount, setFavoritesCount] = useState(0)

  const getPrompt = useCallback(() => {
    const key = mode === 'base' ? `base_${variant}` : `copy_${tone}`
    return PROMPTS[key as keyof typeof PROMPTS]
  }, [mode, variant, tone])

  const getFinalPrompt = useCallback(() => {
    const base = getPrompt()
    return task.trim() ? `${base}\n\n---\n\nMY TASK:\n${task.trim()}` : base
  }, [getPrompt, task])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getFinalPrompt())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = getFinalPrompt()
      textarea.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

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
          charCount: getFinalPrompt().length
        })
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      fetchFavoritesCount()
    } catch (e) {
      console.error('Failed to save:', e)
    }
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

  const selectFromHistory = (record: PromptRecord) => {
    setMode(record.mode as 'base' | 'copy')
    if (record.variant) setVariant(record.variant as 'master' | 'glm' | 'concise')
    if (record.tone) setTone(record.tone as 'faith' | 'insurance' | 'personal')
    if (record.task) setTask(record.task)
    setHistoryOpen(false)
  }

  const charCount = getFinalPrompt().length

  return (
    <div className="min-h-screen bg-[#050505] text-white relative noise-overlay">
      <AmbientBackground />
      
      <div className="relative z-10 max-w-md mx-auto px-4 pt-safe-top pb-32">
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
              onClick={() => setHistoryOpen(true)}
              className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white/60 transition-all"
            >
              <span className="text-base">⏱</span>
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#f5c518] text-black text-[9px] font-bold flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>
            <span className="font-mono text-[9px] text-white/30 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              v3.3
            </span>
          </div>
        </motion.header>

        {/* Task Section */}
        <motion.section 
          className="mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
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
            <p className="text-[11px] text-white/30 mt-3 flex items-center gap-2">
              <span className="text-[#f5c518]">→</span>
              Leave blank to copy base prompt only
            </p>
          </div>
        </motion.section>

        {/* Mode Section */}
        <motion.section 
          className="mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[10px] tracking-widest uppercase text-white/40 mb-3 flex items-center gap-2">
            <span className="w-4 h-px bg-white/10" />
            Mode
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode('base')}
              className={`relative p-5 rounded-2xl text-left overflow-hidden transition-all duration-300 ${
                mode === 'base' ? 'bg-white/10 border-[#f5c518]/50' : 'bg-white/5 border-white/5 hover:bg-white/[0.07]'
              } border`}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-gold transform origin-left transition-transform duration-300" 
                style={{ transform: mode === 'base' ? 'scaleX(1)' : 'scaleX(0)' }} 
              />
              <span className="text-xl block mb-2">⚡</span>
              <span className="text-sm font-semibold block mb-1">Base Mode</span>
              <span className="text-[11px] text-white/40">Strategy · Code · Research</span>
            </button>
            <button
              onClick={() => setMode('copy')}
              className={`relative p-5 rounded-2xl text-left overflow-hidden transition-all duration-300 ${
                mode === 'copy' ? 'bg-white/10 border-[#f5c518]/50' : 'bg-white/5 border-white/5 hover:bg-white/[0.07]'
              } border`}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-gold transform origin-left transition-transform duration-300" 
                style={{ transform: mode === 'copy' ? 'scaleX(1)' : 'scaleX(0)' }} 
              />
              <span className="text-xl block mb-2">✍️</span>
              <span className="text-sm font-semibold block mb-1">Copywriting</span>
              <span className="text-[11px] text-white/40">Captions · Emails · Sales</span>
            </button>
          </div>
        </motion.section>

        {/* Variant/Tone Section */}
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
                Variant · tap for details
              </p>
              <div className="grid grid-cols-3 gap-3">
                {(['master', 'glm', 'concise'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => { setVariant(v); setActiveTooltip(v) }}
                    className={`relative p-4 rounded-2xl text-center transition-all duration-300 ${
                      variant === v ? 'bg-white/10 border-[#f5c518]/50' : 'bg-white/5 border-white/5 hover:bg-white/[0.07] active:scale-95'
                    } border`}
                  >
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-gold transform origin-left transition-transform duration-300" 
                      style={{ transform: variant === v ? 'scaleX(1)' : 'scaleX(0)' }} 
                    />
                    <span className={`text-2xl font-bold block mb-1 transition-all ${variant === v ? 'text-[#f5c518] glow-gold-text' : 'text-white/30'}`}>
                      {v === 'master' ? '1' : v === 'glm' ? '2' : '3'}
                    </span>
                    <span className="text-[9px] tracking-widest uppercase text-white/40">{v.charAt(0).toUpperCase() + v.slice(1)}</span>
                  </button>
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
                Tone · tap for details
              </p>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { id: 'faith', emoji: '🙏', label: 'Faith' },
                  { id: 'insurance', emoji: '🛡️', label: 'Insurance' },
                  { id: 'personal', emoji: '🎯', label: 'Brand' }
                ] as const).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setTone(t.id); setActiveTooltip(t.id) }}
                    className={`relative p-4 rounded-2xl text-center transition-all duration-300 ${
                      tone === t.id ? 'bg-white/10 border-[#f5c518]/50' : 'bg-white/5 border-white/5 hover:bg-white/[0.07] active:scale-95'
                    } border`}
                  >
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-gold transform origin-left transition-transform duration-300" 
                      style={{ transform: tone === t.id ? 'scaleX(1)' : 'scaleX(0)' }} 
                    />
                    <span className="text-2xl block mb-1">{t.emoji}</span>
                    <span className="text-[9px] tracking-widest uppercase text-white/40">{t.label}</span>
                  </button>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Output Section */}
        <motion.section 
          className="mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] tracking-widest uppercase text-white/40 flex items-center gap-2">
              <span className="w-4 h-px bg-white/10" />
              Prompt Preview
            </p>
            <span className="font-mono text-[10px] text-white/30 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              {charCount.toLocaleString()} chars
            </span>
          </div>
          <div className="glass rounded-2xl p-5">
            <pre className="font-mono text-[11px] leading-relaxed text-white/60 whitespace-pre-wrap break-words max-h-[200px] overflow-y-auto">
              {getPrompt()}
            </pre>
          </div>
        </motion.section>

        {/* Tips */}
        <motion.section 
          className="pt-6 border-t border-white/5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
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

      {/* Fixed CTA Buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe-bottom bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent">
        <div className="max-w-md mx-auto flex gap-3">
          <motion.button
            onClick={savePrompt}
            className="flex-1 py-4 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-300 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
            whileTap={{ scale: 0.98 }}
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {saved ? '✓ Saved!' : '☆ Save'}
          </motion.button>
          <motion.button
            onClick={copyToClipboard}
            className={`flex-[2] py-4 rounded-2xl font-semibold text-base tracking-wide relative overflow-hidden transition-all duration-300 ${
              copied ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-gold'
            } text-black`}
            whileTap={{ scale: 0.98 }}
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="text-lg">{copied ? '✓' : '⎘'}</span>
              <span>{copied ? (task ? 'Copied!' : 'Copied!') : 'Copy Prompt'}</span>
            </span>
          </motion.button>
        </div>
      </div>

      {/* Tooltip Modal */}
      <AnimatePresence>
        {activeTooltip && TOOLTIPS[activeTooltip as keyof typeof TOOLTIPS] && (
          <>
            <motion.div
              className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveTooltip(null)}
            />
            <motion.div
              className="fixed z-[201] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-[340px] glass rounded-3xl p-6 border border-white/5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <button onClick={() => setActiveTooltip(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 transition-colors">×</button>
              <span className="text-[13px] font-semibold tracking-wide text-[#f5c518] block mb-3 pb-3 border-b border-white/10">{TOOLTIPS[activeTooltip as keyof typeof TOOLTIPS].badge}</span>
              <p className="text-[13px] leading-relaxed text-white/60">{TOOLTIPS[activeTooltip as keyof typeof TOOLTIPS].body}</p>
              <span className="inline-block mt-4 text-[10px] tracking-wide uppercase text-[#ff6b35] bg-[#ff6b35]/10 border border-[#ff6b35]/20 px-3 py-1.5 rounded-full">{TOOLTIPS[activeTooltip as keyof typeof TOOLTIPS].tag}</span>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* History Panel */}
      <HistoryPanel
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelect={selectFromHistory}
        onRefresh={fetchFavoritesCount}
      />
    </div>
  )
}
