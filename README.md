# Wall Calendar

A beautiful, interactive, and personalized web-based wall calendar built with modern React features. It focuses on aesthetics and user experience, featuring customizable themes, dynamic image backgrounds, and smooth animations.

## 🚀 Features

- **Interactive Calendar Grid:** A fully functional calendar with support for event planning, multi-day range selections, and contextual tooltips. You can right-click or use the action overlay to add events and specific date notes.
- **Micro-Interactions & Events:** Features date hover states, seamless drag-to-select range highlights, and an integrated event management modal to add/edit/delete scheduled items.
- **Dynamic Theming:** Automatically extracts responsive color palettes from corresponding monthly images using `fast-average-color` and `chroma-js`. The UI (highlights, text, accents, backgrounds) seamlessly morphs to match the image's vibe.
- **Classy Animations (GSAP & Framer Motion):** 
  - **3D Page Flips:** Swiping or scrolling triggers a realistic 3D perspective page flip, replicating the tactile feel of a physical wall calendar.
  - **Ambient Breeze Effect:** A subtle, continuous sine-wave animation makes the calendar gently sway when idle, bringing the digital object to life.
  - **Elastic UI:** Spring-based pop and scale animations (`elastic.out`) provide satisfying feedback when interacting with dates and opening the notes/event modals.
- **Immersive Audio:** Includes a dedicated sound engine with toggleable audio. Enjoy a continuous, subtle ambient wind loop and satisfying, physical page-flip sound effects synced directly to your scroll actions.
- **Persistent State Management:** Built with `zustand` to safely store calendar events, notes, and user settings (including sound preferences and visited states) locally in the browser.
- **Photorealistic UI Elements:** Custom CSS and SVG work to recreate realistic physical calendar bindings, punched holes, and metallic spiral rings with drop shadows.

## 🛠️ Architecture & Choices

- **Next.js 16 (App Router):** Chosen for its optimized rendering and out-of-the-box performance capabilities, acting as the primary framework.
- **Tailwind CSS v4:** Used for atomic, responsive styling. It allows rapid UI development while maintaining a minimal and clean design language.
- **Zustand (with Persistence):** Selected over Context API or Redux for its boilerplate-free integration and built-in persistence layers for saving user events and visual preferences across sessions.
- **Date-Fns:** Replaces native Date object complexity. It provides reliable, immutable date manipulation functions, crucial for accurate calendar rendering.
- **GSAP & Framer Motion:** Chosen to elevate the polish of the application, orchestrating complex sequencing for the "Wall Calendar" page flips and modal interactions.

## 💻 Getting Started Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository and navigate into it:**
   ```bash
   cd calender
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

### Running the Development Server

Start the local Next.js development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The application will hot-reload as you make modifications.

## 🏗️ Building for Production

To create an optimized production build:

```bash
npm run build
npm run start
```

