# MARKY PROMPT SYSTEM — GLM Edition v3.5

> **The ultimate modular AI prompt builder with NVIDIA Build API integration.**
> Build, customize, and deploy production-ready prompts for GLM and beyond.

[![Version](https://img.shields.io/badge/version-3.5--GLM-blueviolet)](https://github.com/marktantongco/marky-prompt-system)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![NVIDIA Build](https://img.shields.io/badge/NVIDIA-Build_API-76b900?logo=nvidia)](https://build.nvidia.com/)

---

## 🚀 What's New in v3.5

### 🤖 NVIDIA Build API Integration
- **Live Chat Modal**: Chat directly with NVIDIA models
- **Multiple Models**: Llama 4 Maverick, Nemotron 3 Super (FREE!), Llama 3.1 Nemotron
- **API Key Included**: Ready-to-use integration
- **Streaming Support**: Real-time responses

### 🧩 Modular Prompt System
- **Toggleable Modules**: Enable/disable individual prompt components
- **Dynamic Assembly**: Prompts update in real-time based on configuration
- **Three Categories**: Core, Add-ons, Skills

### ⚡ Quick Actions Toolbar
- **📋 Copy as Markdown**: Perfect for Cursor, Claude Projects, Notion
- **📄 Copy as Plain Text**: Clean text for any platform
- **🔗 Copy URL**: Share your exact configuration via URL parameters
- **💾 Save Preset**: Store custom configurations locally

### 📊 Live Metrics
- Real-time token estimation
- Character count display
- Module count tracking

---

## 🎭 Mode Variants

### 1. Master Mode (Full System)
All sections active. Maximum context and capabilities.

### 2. GLM Native (Optimized)
Core rules + Advocacy + Writing only. Optimized for GLM's context limits.

### 3. Concise (Minimal)
Core Rules + Hard Stops only. Shortest token count.

---

## 🧠 Prompt Modules

### Core Modules
| Module | Description |
|--------|-------------|
| **Role Definition** | Who the AI acts as |
| **Core Rules** | 10 fundamental operating principles |
| **Hard Stops** | Non-negotiable constraints |
| **Response Framework** | Structure for complex tasks |
| **Advocacy Mode** | AI acts as your advocate |
| **Writing Style** | Voice and tone guidelines |

### Add-on Modules
| Module | Description |
|--------|-------------|
| **+Code Module** | Enhanced coding rules |
| **+Design Module** | UI/UX design guidelines |
| **+Copywriting Module** | Copywriting frameworks |
| **Special Commands** | //clear, //focus, //audit, //nvidia |

### Skill Modules
| Module | Description |
|--------|-------------|
| **Skill Library** | External skill references |
| **NVIDIA Build API** | Llama 4 + Nemotron integration |
| **Project Context** | powerUP brand context |

---

## 🤖 NVIDIA Build API

### Available Models

| Model | Description | Cost |
|-------|-------------|------|
| **Llama 4 Maverick** | Meta's latest 17B model | Paid |
| **Nemotron 3 Super** | NVIDIA's 49B model | **FREE** |
| **Llama 3.1 Nemotron** | 70B NVIDIA-tuned | Paid |
| **Nemotron 4** | 340B flagship | Paid |

### API Usage

```python
import requests

headers = {
  "Authorization": "Bearer $NVIDIA_API_KEY",
  "Accept": "application/json"
}

payload = {
  "model": "nvidia/nemotron-3-super-49b-v1",
  "messages": [{"role":"user","content":"Your prompt"}],
  "max_tokens": 2048,
  "temperature": 0.7
}

response = requests.post(
  "https://integrate.api.nvidia.com/v1/chat/completions",
  headers=headers, json=payload
)
print(response.json())
```

### Special Command: //nvidia

When you type `//nvidia` in your prompt, the full NVIDIA Build API integration is injected:
- API token and endpoint
- Sample Python code
- Available models
- Usage instructions

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Styling** | Tailwind CSS 4 |
| **Animation** | Framer Motion |
| **Database** | Prisma + SQLite |
| **AI API** | NVIDIA Build API |
| **Design** | Neo-Brutalist, Glassmorphism |

---

## 🏗️ Project Structure

```
marky-prompt-system/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main prompt builder
│   │   ├── layout.tsx        # Root layout
│   │   ├── globals.css       # Design system
│   │   └── api/
│   │       ├── prompts/      # History API
│   │       └── nvidia/       # NVIDIA Build API
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

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL="file:./dev.db"
NVIDIA_API_KEY="your-nvidia-api-key"
```

---

## 📖 Usage Guide

### Building a Prompt

1. **Click "Build Your System Prompt"** to open the builder
2. **Select Mode**: Base (Strategy/Code) or Copywriting
3. **Choose Variant**: Master, GLM Native, or Concise
4. **Toggle Modules**: Enable only what you need
5. **Add Task** (optional): Specific instruction for this session
6. **Copy Prompt**: Use the quick actions toolbar

### NVIDIA Chat

1. Click the **🤖** icon in the header
2. Select your model (Nemotron 3 Super is FREE!)
3. Start chatting with NVIDIA AI

### Sharing Configurations

Click **🔗 URL** to generate a shareable link:

```
https://yoursite.com/?mode=base&variant=glm&task=Write%20code
```

### Saving Presets

1. Click **📂** in the header
2. Enter a name (e.g., "My Coding Setup")
3. Presets are saved to localStorage

---

## 🎨 Design System

### Colors

| Name | Hex | Usage |
|------|-----|-------|
| Void | `#050505` | Background |
| Gold | `#f5c518` | Primary accent |
| Amber | `#ff6b35` | Secondary accent |
| NVIDIA Green | `#76b900` | Skill modules |
| Surface | `rgba(15, 15, 17, 0.85)` | Glass panels |

---

## 📚 MASTER_REFERENCE.md

This project includes a comprehensive prompt engineering library:

- **8-Layer Prompt Architecture**: ROLE → CONTEXT → OBJECTIVE → CONSTRAINTS → AESTHETIC → PLANNING → OUTPUT → REFINEMENT
- **Animal Thinking Modes**: Rabbit, Owl, Ant, Eagle, Dolphin, Beaver, Elephant
- **Enhancement Protocols**: Self-refinement loops, Chain-of-thought
- **Design Vocabulary**: glassmorphism, brutalist ui, kinetic typography

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

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

<p align="center">
  <strong>MARKY PROMPT SYSTEM v3.5</strong><br>
  <span style="color: #f5c518">Build better prompts. Get better results.</span>
</p>
