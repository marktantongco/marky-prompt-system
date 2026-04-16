# MARKY PROMPT SYSTEM — GLM Edition

> **The ultimate AI prompt builder for GLM (z.chat) and beyond.**
> Modular, customizable, and designed for power users who demand precision.

[![Version](https://img.shields.io/badge/version-3.4--GLM-blueviolet)](https://github.com/marktantongco/marky-prompt-system)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

---

## 🚀 Features

### 🧩 Modular Prompt System
- **Toggleable Modules**: Enable/disable individual prompt components
- **Dynamic Assembly**: Prompts update in real-time based on configuration
- **Add-on Modules**: +Code, +Design, +Copywriting extensions

### ⚡ Quick Actions Toolbar
- **📋 Copy Prompt**: One-click copy to clipboard
- **📋 Copy as Markdown**: Perfect for Cursor, Claude Projects, Notion
- **🔗 Copy URL**: Share your exact configuration via URL parameters
- **💾 Save Preset**: Store custom configurations for reuse

### 📊 Live Token Counter
- Real-time token estimation (~4 chars per token)
- Character count display
- Module count tracking

### 🎨 Interactive Mode Cards
- Hover previews for each mode variant
- Visual feedback with gold accent animations
- Tag-based descriptions (Most Explicit, Most Natural, Fastest)

### 🎭 Dual Mode System
- **Base Mode**: Strategy, Code, Research
  - Master (Full structured ruleset)
  - GLM Native (Optimized for GLM's reasoning)
  - Concise (Shortest token count)
- **Copywriting Mode**: Captions, Emails, Sales
  - Faith (@markytanky) - Warm, conviction-driven
  - Insurance (Pacific Cross) - Trust-first, protective
  - Brand (LinkedIn) - Direct, honest, story-led

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
| **Design** | Glassmorphism, Kinetic Typography |
| **PWA** | Service Worker, Web App Manifest |

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
4. **Toggle Modules**: Enable only what you need
5. **Add Task** (optional): Specific instruction for this session
6. **Copy Prompt**: Use the quick actions toolbar

### Sharing Configurations

Click **🔗 Copy URL** to generate a shareable link with your current configuration embedded in URL parameters:

```
https://yoursite.com/?mode=base&variant=glm&task=Write%20a%20caption
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
    content: `CUSTOM RULES:
- Rule 1
- Rule 2`
  }
}
```

---

## 📚 MASTER_REFERENCE.md

This project includes a comprehensive prompt engineering library:

- **8-Layer Prompt Architecture**: ROLE → CONTEXT → OBJECTIVE → CONSTRAINTS → AESTHETIC → PLANNING → OUTPUT → REFINEMENT
- **Animal Thinking Modes**: Rabbit, Owl, Ant, Eagle, Dolphin, Beaver, Elephant
- **Enhancement Protocols**: Self-refinement loops, Chain-of-thought
- **Design Vocabulary**: glassmorphism, brutalist ui, kinetic typography, etc.
- **Quality Checklists**: Structure, Design, Technical, Quality criteria

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
- Icons and emojis for visual flair

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/marktantongco/marky-prompt-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/marktantongco/marky-prompt-system/discussions)

---

<p align="center">
  <strong>MARKY PROMPT SYSTEM</strong><br>
  <span style="color: #f5c518">Build better prompts. Get better results.</span>
</p>
