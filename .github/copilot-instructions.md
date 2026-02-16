# Image Checker - Copilot Instructions

## Project Overview
**Image Checker** is a React + TypeScript + Vite application that validates images against article text. The app has three main components:
- **Header**: Display application title
- **MasterTextInput**: Textarea for article text input
- **ImageUploader**: Multi-image upload with preview and deletion functionality

## Architecture & Data Flow

### Component Structure
```
App.tsx (root component)
├── Header (display title)
├── MasterTextInput (article text input, local state)
└── ImageUploader (image upload/preview, manages ImageItem[] state)
```

**State Management**: Currently uses React's built-in `useState`. No external state management library yet.

### ImageItem Interface Pattern
```typescript
interface ImageItem {
  id: string;        // Unique identifier (crypto.randomUUID())
  file: File;        // Original File object from input
  preview: string;   // Base64 data URL for preview display
}
```
This pattern separates file data (for processing) from preview (for UI display).

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check with `tsc` then build for production |
| `npm run lint` | Run ESLint across entire project |
| `npm run preview` | Preview production build locally |

**Build Process**: Always runs TypeScript compilation before Vite build (`tsc -b && vite build`).

## Key Patterns & Conventions

### React Hooks Usage
- Use `useState` for component-level state (current pattern)
- Include detailed comments explaining onChange logic (see MasterTextInput.tsx for example)
- Use React 19.2.0+ features (server components, use, etc., as needed)

### File Handling
- Use `FileReader.readAsDataURL()` to create base64 previews for images
- Store both original File object and preview string in state
- Use `crypto.randomUUID()` for unique item IDs (modern, reliable)

### Styling
- Inline styles for quick layouts (current pattern in ImageUploader)
- CSS files exist but minimal (see App.css, index.css)
- No CSS-in-JS library currently in use

### Japanese Comments
- Codebase includes Japanese comments explaining React concepts
- Maintain this educational style when extending components

## ESLint & TypeScript Configuration

**Enabled Rules**:
- TypeScript ESLint: `recommended` level
- React Hooks: `react-hooks.configs.flat.recommended`
- React Refresh: HMR-compatible fast refresh
- ES2020 syntax level with browser globals

**Type Checking**: tsconfig uses strict defaults; check before modifying `tsconfig.app.json` or `tsconfig.node.json`.

## Common Tasks

### Adding a New Component
1. Create `.tsx` file in `src/components/` with named export
2. Use `useState` for local state; extract interface types if complex
3. Include JSDoc comments for complex logic
4. Import and use in parent component

### Connecting Components
Images and text are currently isolated. When implementing validation logic:
- Consider lifting state to `App.tsx` or creating a context
- Pass `images: ImageItem[]` and `text: string` as props
- Pattern example: `<Validator images={images} text={text} />`

### Building/Testing
- Run `npm run build` before commits to catch type errors
- Run `npm run lint` to check code quality
- No test framework currently configured

## Important Notes

- **No external state management**: Consider Redux/Zustand if validation logic becomes complex
- **Minimal styling**: Plan CSS organization if adding many components
- **Japanese locale**: Comments and some text are in Japanese; maintain consistency
- **React Compiler**: Disabled by default; don't enable without discussing performance trade-offs

## File Reference Guide

| File | Purpose |
|------|---------|
| [src/App.tsx](../src/App.tsx) | Root component, orchestrates all subcomponents |
| [src/components/ImageUploader.tsx](../src/components/ImageUploader.tsx) | Image upload, preview, and delete logic |
| [src/components/MasterTextInput.tsx](../src/components/MasterTextInput.tsx) | Article text input with detailed comments |
| [eslint.config.js](../eslint.config.js) | ESLint configuration for TS/React |
| [vite.config.ts](../vite.config.ts) | Vite build configuration |
