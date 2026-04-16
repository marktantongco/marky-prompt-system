# MARKY PROMPT SYSTEM — GLM Edition v3.5

> **The ultimate AI prompt builder for GLM (z.chat) and beyond.**
> Modular, customizable, and designed for power users who demand precision.

[![Version](https://img.shields.io/badge/version-3.5--GLM-blueviolet)](https://github.com/marktantongco/marky-prompt-system)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![NVIDIA Build](https://img.shields.io/badge/NVIDIA-Build_API-76b900?logo=nvidia)](https://build.nvidia.com/)

---

## 🚀 Features

### 🧩 Modular Prompt System
- **Toggleable Modules**: Enable/disable individual prompt components
- **Dynamic Assembly**: Prompts update in real-time based on configuration
- **Category Organization**: Core, Add-ons, and Skills modules
- **Add-on Modules**: +Code, +Design, +Copywriting extensions

### ⚡ Quick Actions Toolbar
- **📋 Copy Plain**: Clean text copy
- **📋 Copy Markdown**: Perfect for Cursor, Claude Projects, Notion
- **🔗 Copy URL**: Share your exact configuration via URL parameters
- **💾 Save**: Store to history database

### 📊 Live Token Counter
- Real-time token estimation (~4 chars per token)
- Character count display
- Module count tracking

### 🎨 Interactive Mode Cards
- Hover previews for each mode variant
- Visual feedback with gold accent animations
- Silent checkmark feedback (no pop-ups!)
- Tag-based descriptions (Most Explicit, Most Natural, Fastest)

### 🎭 Dual Mode System
- **Base Mode**: Strategy, Code, Research
  - Master (Full structured ruleset with all sections)
  - GLM Native (Optimized for GLM's context limits)
  - Concise (Only Core Rules + Hard Stops + Response Framework)
- **Copywriting Mode**: Captions, Emails, Sales
  - Faith (@markytanky) - Warm, conviction-driven
  - Insurance (Pacific Cross) - Trust-first, protective
  - Brand (LinkedIn) - Direct, honest, story-led

### 📦 NVIDIA Build API Integration
- **Llama 4 Maverick** - Fast, versatile
- **Nemotron 3 Super Free** - Cost-effective inference
- **Nemotron 4 340B** - High-quality reasoning
- Ready-to-use API token included

---

## 📱 PWA Support

MARKY is a fully installable Progressive Web App:

- **Offline Support**: Service worker caching
- **Mobile Install**: Add to home screen
- **Native Feel**: Safe area support, smooth animations

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Styling** | Tailwind CSS 4 |
| **Animation** | Framer Motion |
| **Database** | Prisma + SQLite |
| **Design** | Glassmorphism, Kinetic Typography, Neo-Brutalist |
| **PWA** | Service Worker, Web App Manifest |
| **AI API** | NVIDIA Build API |

---

## 🏗️ Project Structure

```
marky-prompt-system/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main prompt builder component
│   │   ├── layout.tsx        # Root layout with fonts
│   │   ├── globals.css       # Design system & animations
│   │   └── api/
│   │       └── prompts/
│   │           └── route.ts  # Prompt history API
│   └── lib/
│       └── prisma.ts         # Database client
├── prisma/
│   └── schema.prisma         # Database schema
├── public/
│   ├── manifest.json         # PWA manifest
│   └── icons/                # App icons
├── MASTER_REFERENCE.md       # Prompt engineering library
├── .cursorrules              # AI instructions
└── README.md                 # This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/marktantongco/marky-prompt-system.git
cd marky-prompt-system

# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Production Build

```bash
npm run build
npm start
```

---

## 📖 Usage Guide

### Building a Prompt

1. **Click "Build Your System Prompt"** to open the builder
2. **Select Mode**: Base (Strategy/Code) or Copywriting
3. **Choose Variant/Tone**: Based on your use case
4. **Toggle Modules**: Enable only what you need (Core, Add-ons, Skills)
5. **Add Task** (optional): Specific instruction for this session
6. **Copy Prompt**: Use the quick actions toolbar

### Sharing Configurations

Click **🔗 URL** to generate a shareable link with your current configuration embedded in URL parameters:

```
https://yoursite.com/?mode=base&variant=glm&task=Write%20a%20caption&m_coreRules=1&m_advocacy=1
```

### Saving Presets

1. Click the **📂** icon in the header
2. Enter a name (e.g., "My Coding Setup")
3. Presets are saved to localStorage
4. Load anytime from the same modal

---

## 🎨 Design System

### Colors

| Name | Hex | Usage |
|------|-----|-------|
| Void | `#050505` | Background |
| Gold | `#f5c518` | Primary accent |
| Amber | `#ff6b35` | Secondary accent |
| Surface | `rgba(15, 15, 17, 0.85)` | Glass panels |
| Success | `#22c55e` | Feedback states |

### Typography

- **Display**: Space Grotesk
- **Body**: Inter
- **Mono**: JetBrains Mono

### Effects

- **Glassmorphism**: Frosted glass panels with backdrop blur
- **Kinetic Typography**: Text animations on state changes
- **Liquid Gradients**: Smooth color transitions
- **Micro-interactions**: Hover, tap, and scroll animations

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL="file:./dev.db"
```

### Customizing Prompts

Edit the `PROMPT_MODULES` object in `src/app/page.tsx`:

```typescript
const PROMPT_MODULES: Record<string, ModuleConfig> = {
  customModule: {
    id: 'customModule',
    label: 'My Custom Module',
    description: 'Does something special',
    enabled: false,
    category: 'addon',
    content: `CUSTOM RULES:
- Rule 1
- Rule 2`
  }
}
```

---

## 📦 NVIDIA Build API

### Available Models

| Model | Description | Best For |
|-------|-------------|----------|
| `meta/llama-4-maverick-17b-128e-instruct` | Fast, versatile | General tasks |
| `nvidia/nemotron-3-8b-instruct` | Nemotron 3 Super Free | Cost-effective |
| `nvidia/nemotron-4-340b-instruct` | High-quality reasoning | Complex tasks |

### Sample Integration

```python
import requests

invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"

headers = {
  "Authorization": "Bearer YOUR_API_KEY",
  "Accept": "application/json"
}

payload = {
  "model": "nvidia/nemotron-3-8b-instruct",
  "messages": [{"role": "user", "content": "Your prompt here"}],
  "max_tokens": 512,
  "temperature": 1.00,
  "top_p": 1.00
}

response = requests.post(invoke_url, headers=headers, json=payload)
print(response.json())
```

Enable the **NVIDIA Build API** module in the Skills category to include full integration details in your prompt.

---

## 📚 MASTER_REFERENCE.md

This project includes a comprehensive prompt engineering library:

- **8-Layer Prompt Architecture**: ROLE → CONTEXT → OBJECTIVE → CONSTRAINTS → AESTHETIC → PLANNING → OUTPUT → REFINEMENT
- **Animal Thinking Modes**: Rabbit, Owl, Ant, Eagle, Dolphin, Beaver, Elephant
- **Enhancement Protocols**: Self-refinement loops, Chain-of-thought
- **Design Vocabulary**: glassmorphism, brutalist ui, kinetic typography, etc.
- **Quality Checklists**: Structure, Design, Technical, Quality criteria
- **Common Workflows**: 18 detailed workflow templates

---

## 🔄 Special Commands

The master prompt supports these commands:

- `//clear` — Reset all context. Next message = new session start.
- `//focus [topic]` — Set project context for this session only.
- `//audit` — Review this prompt. Flag dead rules. Suggest cuts or upgrades.
- `//nvidia` — Inject the full NVIDIA Build API integration.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Animated with [Framer Motion](https://www.framer.com/motion/)
- AI inference via [NVIDIA Build API](https://build.nvidia.com/)

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/marktantongco/marky-prompt-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/marktantongco/marky-prompt-system/discussions)

---

<p align="center">
  <strong>MARKY PROMPT SYSTEM v3.5</strong><br>
  <span style="color: #f5c518">Build better prompts. Get better results.</span>
</p>
