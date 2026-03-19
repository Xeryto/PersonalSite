# Personal Website Research Summary — Daniel Igoshin

## What I Gathered About You

**Daniil (Daniel) Igoshin** — CS @ Columbia (Class of 2027, 3.95 GPA, Dean's List)

### Experience
| Role | Company | Highlights |
|------|---------|------------|
| SWE Intern (Full-Stack SRE) | **Intuit Mailchimp** | Dockerized Go CLI (61% MTTD reduction), GCP→AWS migration (610 engineers), DB schema redesign (60→2 tables, 40-60% peak volume reduction) |
| Backend SWE Intern | **The Bulletin** | Flask REST API, +10.5% user acquisition, Gmail API/OAuth2 integration |
| ML Engineering Intern | **Resola** (Moscow) | Scikit-Learn model, body sensor data analysis, 40% manual processing reduction |

### Highlight Projects
| Project | Tech | Impact |
|---------|------|--------|
| **Quillin'** | Swift, FastAPI, Google Vision, MathPix, LLaMA | 95% OCR accuracy on handwritten notes → LaTeX |
| **PricelessEdu** | C#, ASP.NET, MongoDB, AWS EC2 | 800+ monthly signups, 99.9% uptime, 3000+ users |
| **PolkaMono / PolkaMobile / PolkaAPI** | TypeScript, Python | Multi-platform polka dot fashion app ecosystem |
| **subitupExtension** | TypeScript | Browser extension (GitHub Pages deployed) |
| **anomaliesDetector** | Jupyter/Python | ML clustering for exercise form correction |

### Tech Stack (268K+ lines of code)
Python (140K) · JavaScript (66K) · TypeScript (36K) · C# (12K) · Go · Java · C++ · C · SQL · PHP · Swift

### Links
- GitHub: [Xeryto](https://github.com/Xeryto) (24 repos)
- LinkedIn: [digoshin](https://linkedin.com/in/digoshin)
- Email: d.igoshin@columbia.edu

---

## 🎨 Design Concepts — Pick Your Direction

I've researched cutting-edge techniques across award-winning portfolios. Here are **5 distinct directions**, from most to least technically ambitious. You can also mix-and-match.

---

### Option A: 🏗️ **3D Interactive Workshop / Scene**
*Like what you already started exploring!*

A fully immersive Three.js scene (e.g., a workshop desk, a command center, a floating island) where visitors "explore" instead of scroll. Each object is clickable and leads to a section (projects, about, resume).

**Techniques:** Three.js / React Three Fiber, custom GLSL shaders, 3D models (GLTF), spatial audio, physics (Rapier/Cannon)

**Inspiration:** Bruno Simon's car portfolio, JReyes Minecraft-portfolio (Awwwards Honorable Mention), Thibault Introvigne's spaceman world

**Pros:** Maximum wow-factor, screams "deeply technical," extremely memorable
**Cons:** Long build time, heavier load, needs a fallback for mobile, models need sourcing/creating

---

### Option B: 🌌 **Scroll-Driven Cinematic Experience**
A single long page where stunning animations unfold as you scroll — text reveals, parallax layers, particle bursts, sections that fly in with GSAP ScrollTrigger. Think "Apple product page meets developer portfolio."

**Techniques:** GSAP + ScrollTrigger, CSS scroll-driven animations, WebGL shader backgrounds, particle systems, smooth-scroll (Lenis)

**Inspiration:** Apple product pages, Stripe's website, Linear.app

**Pros:** Incredibly polished feel, works on all devices, easier to maintain content, great for storytelling your career arc
**Cons:** Can feel "template-y" if not done with original twists

---

### Option C: 🧩 **Bento Grid Dashboard**
A modern, organized grid layout where each cell is a self-contained interactive card — one shows a live GitHub contribution heatmap, another a spinning 3D avatar, another a code snippet with syntax highlighting, one embeds a mini-game, etc.

**Techniques:** CSS Grid, micro-animations, shader-powered card backgrounds, live API data (GitHub stats), interactive embeds

**Inspiration:** macOS widgets, Vercel dashboard, Arc browser new-tab page

**Pros:** Very modern (hot trend in 2025-26), easy to add/remove sections, great information density, showcases breadth
**Cons:** Less "narrative," can feel more like a dashboard than a personal story

---

### Option D: 💻 **Terminal / IDE Aesthetic**
Your entire site is styled to look like a code editor or terminal. Visitors "type commands" or navigate tabs to discover sections. Syntax-highlighted code blocks contain your actual resume content.

**Techniques:** Monospace typography, custom cursor/caret, typing animations, file-tree navigation, code-block theming (VS Code inspired)

**Inspiration:** Tamal Sen's IDE portfolio, dustinbrett.com (OS-in-a-browser)

**Pros:** Ultra-technical vibe, very on-brand for SWE, unique and memorable
**Cons:** Accessibility concerns, can alienate non-technical visitors (recruiters), novelty can wear off

---

### Option E: ✨ **Minimal Dark + Surgical Micro-Animations**
Clean, dark-mode-first design with premium typography (Inter/Outfit), surgical use of glassmorphism, subtle gradient glows, and perfectly timed micro-interactions on every element. No 3D gimmicks — just flawless execution.

**Techniques:** CSS animations, GSAP for entrance/exit animations, gradient mesh backgrounds, glassmorphism, View Transitions API, custom cursor

**Inspiration:** Linear.app, Raycast.com, Resend.com, Vercel.com

**Pros:** Fast loading, responsive, timeless, professional. Easiest to maintain. Scales well.
**Cons:** Less "wow" in screenshots — the beauty is in the motion and polish

---

## 🧬 Bonus Techniques (Mix Into Any Option)

| Technique | Description | Effort |
|-----------|-------------|--------|
| **Live GitHub heatmap** | Pull your contribution graph in real-time via API | Low |
| **Lines-of-code counter** | Animated counter showing your 268K+ LOC | Low |
| **Interactive tech stack globe** | 3D spinning globe/cloud of your tech logos | Medium |
| **Auto-deployed resume PDF** | `/resume` route serves your actual PDF with download tracking | Low |
| **Custom cursor** | A branded cursor that reacts to hoverable elements | Low |
| **Noise/grain texture overlay** | Adds premium "film" feeling to backgrounds | Low |
| **Magnetic hover buttons** | Buttons that subtly pull toward cursor before click | Low |
| **Scroll-progress indicator** | Thin animated bar showing page progress | Low |
| **Dark/light mode toggle** | With smooth animated transition | Medium |

---

## Questions Before We Proceed

1. **Which direction (A–E) excites you most?** (Or a hybrid — e.g., "B with bento grid sections" or "E with a 3D hero")
2. **Who is the primary audience?** (Recruiters for internships? Clients? Dev community?)
3. **Any sections you definitely want or don't want?** (Blog? Contact form? Resume download?)
4. **Color preferences?** (The 3D workshop experiment suggests you might lean dark/moody — confirm?)
5. **Do you have a professional headshot or avatar** you'd like to include?
6. **Custom domain?** (e.g., danieligoshin.com, xeryto.dev)
