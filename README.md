# MARKY PROMPT SYSTEM — GLM Edition v3.5

> **The ultimate AI prompt builder for GLM (z.chat) and beyond.**
> Modular, customizable, and designed for power users who demand precision.

[![Version](https://img.shields.io/badge/version-3.5--GLM-blueviolet)](https://github.com/marktantongco/marky-prompt-system)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![NVIDIA Build API](https://img.shields.io/badge/NVIDIA-Build%20API-76b900?logo=nvidia)](https://build.nvidia.com/)

---

## 🚀 Features

### 🧩 Modular Prompt System
- **Toggleable Modules**: Enable/disable individual prompt components
- **Dynamic Assembly**: Prompts update in real-time based on configuration
- **Three Categories**: Core, Add-ons, Skills
- **Add-on Modules**: +Code, +Design, +Copywriting extensions

### ⚡ Quick Actions Toolbar
- **📄 Plain Text**: One-click copy to clipboard
- **📋 Markdown**: Perfect for Cursor, Claude Projects, Notion
- **🔗 URL**: Share your exact configuration via URL parameters
- **☆ Save**: Store to database with favorites support

### 📊 Live Token Counter
- Real-time token estimation (~4 chars per token)
- Character count display
- Module count tracking

### 🎨 Interactive Mode Cards
- **Master Mode**: Full system prompt with all sections
- **GLM Optimized**: Stripped for GLM context limits
- **Concise**: Minimal tokens, essential rules only
- Hover previews for each mode variant
- Silent checkmark feedback (NO POPUPS!)

### 🤖 NVIDIA Build API Integration
- **Nemotron 3**: FREE model for testing
- **Llama 4 Maverick**: Advanced 17B parameter model
- Built-in API testing panel
- Token embedded for quick start

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
| **AI API** | NVIDIA Build API |
| **Design** | Glassmorphism, Neo-Brutalist |

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
│   │       ├── prompts/      # Prompt history API
│   │       └── nvidia/       # NVIDIA Build API proxy
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
2. **Select Mode**: Master (Full), GLM (Optimized), or Concise (Minimal)
3. **Toggle Modules**: Enable only what you need
4. **Add Task** (optional): Specific instruction for this session
5. **Copy Prompt**: Use the quick actions toolbar

### Sharing Configurations

Click **🔗 URL** to generate a shareable link with your current configuration embedded in URL parameters:

```
https://yoursite.com/?mode=master&task=Build%20a%20landing%20page
```

### Saving Presets

1. Click the **📂** icon in the header
2. Enter a name in the input field and press Enter
3. Presets are saved to localStorage
4. Load anytime from the same modal

### NVIDIA Build API

1. Click the **🤖** icon in the header
2. Select model (Nemotron 3 is FREE)
3. Enter a test prompt
4. Click **Test API** to verify connection
5. Copy the generated Python code for your project

---

## 🎨 Design System

### Colors

| Name | Hex | Usage |
|------|-----|-------|
| Void | `#050505` | Background |
| Gold | `#f5c518` | Primary accent |
| Amber | `#ff6b35` | Secondary accent |
| NVIDIA Green | `#76b900` | NVIDIA integration |
| Success | `#22c55e` | Confirmations |

### Typography

- **Display**: Space Grotesk
- **Body**: Inter
- **Mono**: JetBrains Mono

### Effects

- **Glassmorphism**: Frosted glass panels with backdrop blur
- **Neo-Brutalist**: Bold typography, high contrast
- **Micro-interactions**: Smooth hover/tap animations
- **No Popups**: Silent visual feedback only

---

## 📦 NVIDIA Build API

### Available Models

| Model | ID | Cost |
|-------|-----|------|
| Nemotron 3 | `nvidia/nemotron-3-8b-instruct` | FREE |
| Llama 4 Maverick | `meta/llama-4-maverick-17b-128e-instruct` | Credits |

### Sample Code

```python
import requests

invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"

headers = {
  "Authorization": "Bearer YOUR_API_KEY",
  "Accept": "application/json"
}

payload = {
  "model": "nvidia/nemotron-3-8b-instruct",
  "messages": [{"role": "user", "content": "Hello!"}],
  "max_tokens": 512,
  "temperature": 0.7
}

response = requests.post(invoke_url, headers=headers, json=payload)
print(response.json())
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL="file:./dev.db"
```

### Customizing Prompts

Edit the `PROMPT_MODULES` object in `src/app/page.tsx` to add custom modules.

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
- AI powered by [NVIDIA Build API](https://build.nvidia.com/)

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/marktantongco/marky-prompt-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/marktantongco/marky-prompt-system/discussions)

---

<p align="center">
  <strong>MARKY PROMPT SYSTEM v3.5</strong><br>
  <span style="color: #f5c518">Build better prompts. Get better results.</span>
</p>
