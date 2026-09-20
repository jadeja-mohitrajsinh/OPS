# OPS — Entrepreneur & Student Operating System

A high-performance, mobile-first personal operating system and management dashboard built for hyper-focused execution across academics (GATE 2027 + College), startup validation (Forge), technical learning (ML & Systems), leadership, and physical peak state.

---

## 🌟 Core System Modules

### 1. 🏠 Executive Dashboard (`/`)
- **Most Important Tasks (MITs)**: Automatic surface of the top 3 highest-leverage tasks.
- **Cognitive Load Reduction**: Dynamically prioritizes items by urgency, impact, and upcoming hard deadlines.
- **Quick Action Bar**: Instant capture for Tasks, Meetings, Research notes, Decisions, and People follow-ups.

### 2. 📅 Calendar & Today Focus (`/today`, `/calendar`)
- Time-blocked daily agenda, scheduled deep work sessions, meeting timelines, and overdue alerts.
- Month and day timeline views with live deadline indicators.

### 3. 🎯 GATE 2027 Mastery Hub (`/gate`)
- Countdown to February 2027 GATE exam.
- Topic-by-topic pipeline tracking: `LEARN` ➔ `UNDERSTAND` ➔ `PRACTICE` ➔ `PYQS` ➔ `REVISE` ➔ `TEST` ➔ `MASTERED`.
- Weak area flagging (`⚠ WEAK AREA`), PYQ practice counters, and subject mastery percentage.

### 4. 🎓 College Academic OS (`/college`)
- Tracking for Mid 1 (Completed), upcoming Mid 2, Viva preparations, ongoing lab assignments, and semester finals.
- Direct links to subjects, syllabus coverage, and submission deadlines.

### 5. ⚡ Forge Startup Hub (`/forge`)
- **Research & Discovery**: Startup hypotheses, discovery notes, stage pipeline (`RESEARCH` ➔ `INSIGHT` ➔ `DECISION` ➔ `ACTION` ➔ `DONE`), and multi-area filtering.
- **Competitor Intelligence**: Dedicated competitor profiles, threat scoring (`CRITICAL` to `WATCHING`), direct/indirect categorizations, strengths, vulnerabilities, and pricing teardowns.
- **Unfair Advantage & Moat Mapping**: Clear definition of why our solution wins over each rival, with 1-click conversion of rival weaknesses into exploitable Forge hypotheses.
- **Feature Battle Matrix & Positioning**: Side-by-side capability scoring (`⭐ Superior`, `✅ Supported`, `⚠️ Partial`, `❌ Missing`) and 2x2 strategic quadrant mapping.

### 6. 🚀 Projects & Milestone Engine (`/projects`, `/projects/[id]`)
- Multi-area initiative tracking with milestone progress bars, blocker/risk logs, key architecture decisions, and notes.

### 7. 🧠 Learning & Knowledge Base (`/learning`)
- ML & AI paper takeaways, system architecture cheatsheets, coding notes, and pinned references.
- Full-text search and type filtering (`note`, `idea`, `insight`, `reference`).

### 8. 📚 Books & Reading OS (`/books`)
- Reading progress tracker (`currentPage / totalPages`).
- **"What I Applied"** enforcement to guarantee theoretical insights translate into real-world action.

### 9. 🎙️ Life, Voice & Fitness OS (`/life`)
- **Daily Rituals & Non-Negotiables**: Check-ins for deep work blocks, morning hydration, and screen discipline.
- **Voice & Communication Log**: Deliberate practice logs with self-ratings, speech cadence, and pitch feedback.
- **Gym & Workout Tracker**: Push/Pull/Legs splits, consistency streaks, and energy ratings.

### 10. 📋 Reviews & Conviction Register (`/reviews`)
- **Weekly & Monthly Loops**: Retrospectives on what went well, what failed, and systemic adjustments.
- **Decisions Log**: Context, options considered, rationale, and review date.
- **Goal Horizon**: 90-Day sprints, 1-Year targets, and multi-year vision.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React Server & Client Components)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose](https://mongoosejs.com/)
- **Styling**: Vanilla CSS Design System with dark mode tokens, micro-animations, glassmorphism, and mobile responsiveness.

---

## 🚀 Getting Started

### 1. Environment Setup
Copy `.env.example` to `.env.local` and add your MongoDB Atlas connection string:
```bash
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/personal_os?retryWrites=true&w=majority
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Seed Initial Data
Visit `http://localhost:3000/api/seed` or trigger the database seed to populate initial GATE subjects, college courses, sample projects, and tasks.

---

## 📱 Mobile-First Architecture
Optimized for high touch accuracy, bottom navigation bar on mobile viewports, rapid search (`/`), and sub-50ms client-side transitions.
