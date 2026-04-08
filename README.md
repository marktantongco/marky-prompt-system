<div align="center">

# MARKY PROMPT SYSTEM

### AI Prompt Builder for GLM — Ultra-Modern Gen-Z PWA

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma)](https://prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**Strategy · Code · Research · Copywriting**

A premium, ultra-modern Progressive Web App for generating optimized AI prompts. Built with Next.js 16, featuring kinetic typography, glassmorphism, and liquid gradients.

[🚀 Live Demo](#) · [📸 Screenshots](#screenshots) · [⚡ Features](#features) · [🛠 Installation](#installation)

</div>

---

## ✨ Features

### 🎯 Core Functionality

| Feature | Description |
|---------|-------------|
| **Base Mode** | Strategy, code, research, planning prompts |
| **Copywriting Mode** | Captions, emails, sales, persuasion prompts |
| **3 Variants** | Master (full), GLM Native (optimized), Concise (minimal) |
| **3 Tones** | Faith 🙏, Insurance 🛡️, Brand 🎯 |
| **Task Input** | Append custom tasks to any prompt |
| **One-Tap Copy** | Copy full prompt + task to clipboard |

### 💾 Data Persistence

| Feature | Description |
|---------|-------------|
| **Prompt History** | Auto-saved prompts with SQLite database |
| **Favorites** | Star prompts for quick access |
| **History Panel** | Slide-out panel with all saved prompts |
| **Restore** | One-tap to reload any saved configuration |

### 🎨 Design System

Built with the **8-Layer Prompt Architecture** from promptc OS:

- **Kinetic Typography** — Animated logo with gold glow effect
- **Glassmorphism** — Frosted glass cards with `backdrop-filter: blur(20px)`
- **Liquid Gradients** — Floating ambient blobs with 20s animation cycle
- **Neon Accent Sparse** — Gold `#f5c518` + Amber `#ff6b35` on `#050505` void
- **Micro-interactions** — Framer Motion animations on every interaction
- **Ambient Motion** — Living background with particle effects
- **Dark-mode Native** — Designed for dark first, pure black background
- **Typography-first** — Bold Space Grotesk + JetBrains Mono for code

### 📱 PWA Features

- ✅ Installable on iOS, Android, Desktop
- ✅ Offline-capable with service worker
- ✅ Custom app icons (16px - 512px)
- ✅ iOS splash screens
- ✅ Safe area support (notch-friendly)
- ✅ 60fps animation budget

---

## 📸 Screenshots

<div align="center">

| Main Interface | History Panel | Tooltip Modal |
|:--------------:|:-------------:|:-------------:|
| ![Main](screenshots/main.png) | ![History](screenshots/history.png) | ![Tooltip](screenshots/tooltip.png) |

</div>

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Animations** | Framer Motion |
| **Database** | SQLite (Prisma ORM) |
| **UI Components** | shadcn/ui |
| **Icons** | Lucide Icons |
| **Fonts** | Space Grotesk, JetBrains Mono |

---

## 📦 Installation

### Prerequisites

- Node.js 18+
- Bun or npm

### Quick Start

```bash
# Clone the repository
git clone https://github.com/marktantongco/marky-prompt-system.git
cd marky-prompt-system

# Install dependencies
bun install

# Set up database
bun run db:push

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./db/custom.db"
```

---

## 📁 Project Structure

```
marky-prompt-system/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── icon-192.png           # App icons
│   └── icon-512.png
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── prompts/       # REST API routes
│   │   ├── globals.css        # Design system
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main component
│   └── lib/
│       └── db.ts              # Prisma client
├── download/
│   └── pwa/                   # Standalone PWA files
├── MASTER_REFERENCE.md        # promptc OS reference
└── README.md
```

---

## 🎮 Usage

### Building Prompts

1. **Select Mode**: Choose Base (strategy/code) or Copywriting (content)
2. **Choose Variant/Tone**: Pick your preferred style
3. **Add Task**: Optionally append your specific task
4. **Copy**: One-tap copy to clipboard

### Managing History

1. Click the **⏱ History** icon in the header
2. View all saved prompts
3. Filter by **Favorites** using the toggle
4. **Use** any prompt to restore it
5. **★** to favorite, **Delete** to remove

---

## 🎨 Design Tokens

```css
/* Colors */
--void: #050505;
--gold: #f5c518;
--amber: #ff6b35;
--glass: rgba(255, 255, 255, 0.03);

/* Gradients */
--gradient-gold: linear-gradient(135deg, #f5c518 0%, #ff6b35 100%);

/* Typography */
--font-display: 'Space Grotesk', sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Animation */
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-liquid: cubic-bezier(0.65, 0, 0.35, 1);
```

---

## 📝 Prompt Templates

### Base Mode Variants

| Variant | Use Case |
|---------|----------|
| **Master** | Full structured ruleset — explicit, detailed |
| **GLM Native** | Optimized for GLM's reasoning — natural, fluid |
| **Concise** | Minimal tokens — fast, essential only |

### Copywriting Tones

| Tone | Use Case |
|------|----------|
| **🙏 Faith** | Spiritual community, motivational content |
| **🛡️ Insurance** | IC Philippines compliant, trust-first |
| **🎯 Brand** | LinkedIn, thought leadership, personal brand |

---

## 🔧 Scripts

```bash
bun run dev        # Start development server
bun run build      # Production build
bun run lint       # Run ESLint
bun run db:push    # Push schema changes
bun run db:generate # Generate Prisma client
```

---

## 📄 License

MIT License — feel free to use for personal or commercial projects.

---

## 🙏 Credits

- **Design System**: Based on [promptc OS](https://github.com/marktantongco/promptc)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Fonts**: [Google Fonts](https://fonts.google.com/)

---

<div align="center">

**Built with ❤️ by [@markytanky](https://github.com/marktantongco)**

[⬆ Back to Top](#marky-prompt-system)

</div>
