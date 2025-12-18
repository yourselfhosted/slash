# UI Components Guide

## Overview

This project uses [shadcn/ui](https://ui.shadcn.com) - a collection of re-usable components built with Radix UI and Tailwind CSS.

## Component Location

All UI primitives are in `src/components/ui/`. These are copied directly into the project, so you own the code.

## Available Components

### Primitives
- Button
- Input
- Label
- Textarea
- Checkbox
- Badge
- Card
- Separator

### Complex Components
- Dialog (Modal)
- Sheet (Drawer)
- Dropdown Menu
- Tooltip
- Avatar
- Alert Dialog
- Sonner (Toast notifications)

### Custom Components
- AnimatedCard (with Framer Motion)

## Adding New Components

Use the shadcn CLI:

```bash
cd frontend/web
npx shadcn@latest add [component-name]
```

## Styling

Components use CSS variables defined in `src/css/index.css`. To customize:

1. Edit CSS variables for colors
2. Modify `tailwind.config.js` for theme changes
3. Use the `cn()` utility from `@/lib/utils` to merge classes

## Design Principles

- **Clean & Minimal**: Linear/Vercel aesthetic
- **Subtle animations**: Fast (150-200ms), purposeful
- **Proper spacing**: Generous whitespace
- **Accessible**: Built on Radix UI primitives
