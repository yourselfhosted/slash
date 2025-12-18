# shadcn/ui Migration - Clean & Minimal UI Redesign

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate from MUI Joy UI to shadcn/ui with a clean, minimal design aesthetic (Linear/Vercel style)

**Architecture:** Phased migration replacing MUI Joy components with shadcn/ui primitives built on Radix UI and Tailwind CSS. Keep existing functionality while improving visual polish, consistency, and maintainability. Enhanced with subtle animations and improved spacing.

**Tech Stack:**
- shadcn/ui (Radix UI primitives + Tailwind)
- Framer Motion (animations)
- class-variance-authority (component variants)
- tailwind-merge & clsx (utility functions)
- Existing: React 18, TypeScript, Vite, lucide-react, Zustand

---

## Phase 1: Setup & Configuration

### Task 1: Install shadcn/ui Dependencies

**Files:**
- Modify: `frontend/web/package.json`

**Step 1: Install required dependencies**

Run:
```bash
cd frontend/web
pnpm add class-variance-authority clsx tailwind-merge
pnpm add -D @types/node
```

Expected: Dependencies installed successfully

**Step 2: Verify installation**

Run:
```bash
pnpm list class-variance-authority clsx tailwind-merge
```

Expected: All three packages listed with versions

**Step 3: Commit**

```bash
git add frontend/web/package.json frontend/web/pnpm-lock.yaml
git commit -m "feat: add shadcn/ui base dependencies"
```

---

### Task 2: Configure shadcn/ui

**Files:**
- Create: `frontend/web/components.json`
- Modify: `frontend/web/tsconfig.json`

**Step 1: Create components.json configuration**

Create `frontend/web/components.json`:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/css/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components/ui",
    "utils": "@/lib/utils"
  }
}
```

**Step 2: Update tsconfig.json with path aliases**

Add to `frontend/web/tsconfig.json` compilerOptions.paths:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Step 3: Verify configuration**

Run:
```bash
cat frontend/web/components.json
```

Expected: File exists with correct JSON

**Step 4: Commit**

```bash
git add frontend/web/components.json frontend/web/tsconfig.json
git commit -m "feat: configure shadcn/ui setup"
```

---

### Task 3: Create Utility Functions

**Files:**
- Create: `frontend/web/src/lib/utils.ts`

**Step 1: Create lib directory and utils file**

Run:
```bash
mkdir -p frontend/web/src/lib
```

Create `frontend/web/src/lib/utils.ts`:
```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 2: Verify file creation**

Run:
```bash
cat frontend/web/src/lib/utils.ts
```

Expected: File contains cn utility function

**Step 3: Commit**

```bash
git add frontend/web/src/lib/utils.ts
git commit -m "feat: add cn utility for class merging"
```

---

### Task 4: Update Tailwind Configuration for shadcn/ui

**Files:**
- Modify: `frontend/web/tailwind.config.js`
- Modify: `frontend/web/src/css/index.css`

**Step 1: Update tailwind.config.js with shadcn theme**

Replace `frontend/web/tailwind.config.js`:
```javascript
/* eslint-disable no-undef */
const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,tsx}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    fontSize: {
      xs: ".75rem",
      sm: ".875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      maxWidth: {
        "8xl": "88rem",
      },
      spacing: {
        112: "28rem",
        128: "32rem",
        180: "45rem",
      },
      zIndex: {
        1: "1",
        20: "20",
        100: "100",
        1000: "1000",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

**Step 2: Install tailwindcss-animate plugin**

Run:
```bash
cd frontend/web
pnpm add -D tailwindcss-animate
```

Expected: Plugin installed

**Step 3: Add CSS variables to index.css**

Prepend to `frontend/web/src/css/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Step 4: Verify CSS compiles**

Run:
```bash
cd frontend/web
pnpm run build
```

Expected: Build succeeds without CSS errors

**Step 5: Commit**

```bash
git add frontend/web/tailwind.config.js frontend/web/src/css/index.css frontend/web/package.json frontend/web/pnpm-lock.yaml
git commit -m "feat: configure tailwind with shadcn theme and CSS variables"
```

---

## Phase 2: Install Core shadcn Components

### Task 5: Install Button Component

**Files:**
- Create: `frontend/web/src/components/ui/button.tsx`

**Step 1: Install button component via shadcn CLI**

Run:
```bash
cd frontend/web
npx shadcn@latest add button
```

Expected: Creates `src/components/ui/button.tsx`

**Step 2: Verify button component exists**

Run:
```bash
cat frontend/web/src/components/ui/button.tsx | head -20
```

Expected: File contains Button component with variants

**Step 3: Commit**

```bash
git add frontend/web/src/components/ui/button.tsx
git commit -m "feat: add shadcn button component"
```

---

### Task 6: Install Input Component

**Files:**
- Create: `frontend/web/src/components/ui/input.tsx`

**Step 1: Install input component**

Run:
```bash
cd frontend/web
npx shadcn@latest add input
```

Expected: Creates `src/components/ui/input.tsx`

**Step 2: Commit**

```bash
git add frontend/web/src/components/ui/input.tsx
git commit -m "feat: add shadcn input component"
```

---

### Task 7: Install Label Component

**Files:**
- Create: `frontend/web/src/components/ui/label.tsx`

**Step 1: Install label component**

Run:
```bash
cd frontend/web
npx shadcn@latest add label
```

Expected: Creates `src/components/ui/label.tsx`

**Step 2: Commit**

```bash
git add frontend/web/src/components/ui/label.tsx
git commit -m "feat: add shadcn label component"
```

---

### Task 8: Install Card Component

**Files:**
- Create: `frontend/web/src/components/ui/card.tsx`

**Step 1: Install card component**

Run:
```bash
cd frontend/web
npx shadcn@latest add card
```

Expected: Creates `src/components/ui/card.tsx`

**Step 2: Commit**

```bash
git add frontend/web/src/components/ui/card.tsx
git commit -m "feat: add shadcn card component"
```

---

### Task 9: Install Badge Component

**Files:**
- Create: `frontend/web/src/components/ui/badge.tsx`

**Step 1: Install badge component**

Run:
```bash
cd frontend/web
npx shadcn@latest add badge
```

Expected: Creates `src/components/ui/badge.tsx`

**Step 2: Commit**

```bash
git add frontend/web/src/components/ui/badge.tsx
git commit -m "feat: add shadcn badge component"
```

---

### Task 10: Install Separator Component

**Files:**
- Create: `frontend/web/src/components/ui/separator.tsx`

**Step 1: Install separator component (replaces MUI Divider)**

Run:
```bash
cd frontend/web
npx shadcn@latest add separator
```

Expected: Creates `src/components/ui/separator.tsx`

**Step 2: Commit**

```bash
git add frontend/web/src/components/ui/separator.tsx
git commit -m "feat: add shadcn separator component"
```

---

## Phase 3: Install Complex Components

### Task 11: Install Dialog Component

**Files:**
- Create: `frontend/web/src/components/ui/dialog.tsx`

**Step 1: Install dialog component**

Run:
```bash
cd frontend/web
npx shadcn@latest add dialog
```

Expected: Creates `src/components/ui/dialog.tsx` with Radix Dialog primitives

**Step 2: Commit**

```bash
git add frontend/web/src/components/ui/dialog.tsx
git commit -m "feat: add shadcn dialog component"
```

---

### Task 12: Install Sheet Component (Drawer Replacement)

**Files:**
- Create: `frontend/web/src/components/ui/sheet.tsx`

**Step 1: Install sheet component (replaces MUI Drawer)**

Run:
```bash
cd frontend/web
npx shadcn@latest add sheet
```

Expected: Creates `src/components/ui/sheet.tsx`

**Step 2: Commit**

```bash
git add frontend/web/src/components/ui/sheet.tsx
git commit -m "feat: add shadcn sheet component (drawer replacement)"
```

---

### Task 13: Install Dropdown Menu Component

**Files:**
- Create: `frontend/web/src/components/ui/dropdown-menu.tsx`

**Step 1: Install dropdown-menu component**

Run:
```bash
cd frontend/web
npx shadcn@latest add dropdown-menu
```

Expected: Creates `src/components/ui/dropdown-menu.tsx`

**Step 2: Commit**

```bash
git add frontend/web/src/components/ui/dropdown-menu.tsx
git commit -m "feat: add shadcn dropdown-menu component"
```

---

### Task 14: Install Tooltip Component

**Files:**
- Create: `frontend/web/src/components/ui/tooltip.tsx`

**Step 1: Install tooltip component**

Run:
```bash
cd frontend/web
npx shadcn@latest add tooltip
```

Expected: Creates `src/components/ui/tooltip.tsx`

**Step 2: Commit**

```bash
git add frontend/web/src/components/ui/tooltip.tsx
git commit -m "feat: add shadcn tooltip component"
```

---

### Task 15: Install Checkbox Component

**Files:**
- Create: `frontend/web/src/components/ui/checkbox.tsx`

**Step 1: Install checkbox component**

Run:
```bash
cd frontend/web
npx shadcn@latest add checkbox
```

Expected: Creates `src/components/ui/checkbox.tsx`

**Step 2: Commit**

```bash
git add frontend/web/src/components/ui/checkbox.tsx
git commit -m "feat: add shadcn checkbox component"
```

---

### Task 16: Install Textarea Component

**Files:**
- Create: `frontend/web/src/components/ui/textarea.tsx`

**Step 1: Install textarea component**

Run:
```bash
cd frontend/web
npx shadcn@latest add textarea
```

Expected: Creates `src/components/ui/textarea.tsx`

**Step 2: Commit**

```bash
git add frontend/web/src/components/ui/textarea.tsx
git commit -m "feat: add shadcn textarea component"
```

---

### Task 17: Install Avatar Component

**Files:**
- Create: `frontend/web/src/components/ui/avatar.tsx`

**Step 1: Install avatar component**

Run:
```bash
cd frontend/web
npx shadcn@latest add avatar
```

Expected: Creates `src/components/ui/avatar.tsx`

**Step 2: Commit**

```bash
git add frontend/web/src/components/ui/avatar.tsx
git commit -m "feat: add shadcn avatar component"
```

---

### Task 18: Install Sonner (Toast Replacement)

**Files:**
- Create: `frontend/web/src/components/ui/sonner.tsx`

**Step 1: Install sonner component (modern toast replacement)**

Run:
```bash
cd frontend/web
npx shadcn@latest add sonner
```

Expected: Creates `src/components/ui/sonner.tsx` and installs sonner package

**Step 2: Commit**

```bash
git add frontend/web/src/components/ui/sonner.tsx frontend/web/package.json frontend/web/pnpm-lock.yaml
git commit -m "feat: add shadcn sonner component (toast replacement)"
```

---

## Phase 4: Migrate Application Components

### Task 19: Migrate Custom Dropdown Component

**Files:**
- Modify: `frontend/web/src/components/common/Dropdown.tsx`

**Step 1: Backup original dropdown**

Run:
```bash
cp frontend/web/src/components/common/Dropdown.tsx frontend/web/src/components/common/Dropdown.tsx.backup
```

Expected: Backup created

**Step 2: Replace with shadcn dropdown-menu**

Replace `frontend/web/src/components/common/Dropdown.tsx`:
```typescript
import { ReactNode } from "react";
import Icon from "@/components/Icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  trigger?: ReactNode;
  actions?: ReactNode;
  className?: string;
  actionsClassName?: string;
}

const Dropdown: React.FC<Props> = (props: Props) => {
  const { trigger, actions, className, actionsClassName } = props;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={className} asChild>
        {trigger ? (
          <div>{trigger}</div>
        ) : (
          <button className="flex flex-row justify-center items-center rounded text-muted-foreground hover:text-foreground transition-colors">
            <Icon.MoreVertical className="w-4 h-auto" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className={actionsClassName} align="end">
        {actions}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Dropdown;
```

**Step 3: Test dropdown still works**

Run:
```bash
cd frontend/web
pnpm run dev
```

Expected: Dev server starts, dropdown renders without errors

**Step 4: Commit**

```bash
git add frontend/web/src/components/common/Dropdown.tsx
git commit -m "refactor: migrate Dropdown to shadcn dropdown-menu"
```

---

### Task 20: Migrate Alert Component

**Files:**
- Modify: `frontend/web/src/components/Alert.tsx`

**Step 1: Install alert-dialog component**

Run:
```bash
cd frontend/web
npx shadcn@latest add alert-dialog
```

Expected: Creates `src/components/ui/alert-dialog.tsx`

**Step 2: Replace Alert component with shadcn**

Replace `frontend/web/src/components/Alert.tsx`:
```typescript
import { createRoot } from "react-dom/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type AlertStyle = "default" | "destructive";

interface Props {
  title: string;
  content: string;
  style?: AlertStyle;
  closeBtnText?: string;
  confirmBtnText?: string;
  onClose?: () => void;
  onConfirm?: () => void;
}

const defaultProps: Partial<Props> = {
  style: "default",
  closeBtnText: "Close",
  confirmBtnText: "Confirm",
  onClose: () => null,
  onConfirm: () => null,
};

const Alert: React.FC<Props> = (props: Props) => {
  const { title, content, closeBtnText, confirmBtnText, onClose, onConfirm, style } = {
    ...defaultProps,
    ...props,
  };

  const handleCloseBtnClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleConfirmBtnClick = async () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{content}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCloseBtnClick}>
            {closeBtnText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmBtnClick}
            className={style === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
          >
            {confirmBtnText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const showCommonDialog = (props: Props) => {
  const tempDiv = document.createElement("div");
  const dialog = createRoot(tempDiv);
  document.body.append(tempDiv);

  const destroy = () => {
    dialog.unmount();
    tempDiv.remove();
  };

  const onClose = () => {
    if (props.onClose) {
      props.onClose();
    }
    destroy();
  };

  const onConfirm = () => {
    if (props.onConfirm) {
      props.onConfirm();
    }
    destroy();
  };

  dialog.render(<Alert {...props} onClose={onClose} onConfirm={onConfirm} />);
};

export default Alert;
```

**Step 3: Commit**

```bash
git add frontend/web/src/components/Alert.tsx frontend/web/src/components/ui/alert-dialog.tsx
git commit -m "refactor: migrate Alert to shadcn alert-dialog"
```

---

### Task 21: Migrate ShortcutCard Component

**Files:**
- Modify: `frontend/web/src/components/ShortcutCard.tsx`

**Step 1: Replace MUI components with shadcn**

Update `frontend/web/src/components/ShortcutCard.tsx`:
```typescript
import classNames from "classnames";
import copy from "copy-to-clipboard";
import { useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { absolutifyLink } from "@/helpers/utils";
import { useUserStore, useViewStore } from "@/stores";
import { Shortcut } from "@/types/proto/api/v1/shortcut_service";
import Icon from "./Icon";
import LinkFavicon from "./LinkFavicon";
import ShortcutActionsDropdown from "./ShortcutActionsDropdown";
import VisibilityIcon from "./VisibilityIcon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  shortcut: Shortcut;
}

const ShortcutCard = (props: Props) => {
  const { shortcut } = props;
  const { t } = useTranslation();
  const userStore = useUserStore();
  const viewStore = useViewStore();
  const creator = userStore.getUserById(shortcut.creatorId);
  const shortcutLink = absolutifyLink(`/s/${shortcut.name}`);

  useEffect(() => {
    userStore.getOrFetchUserById(shortcut.creatorId);
  }, []);

  const handleCopyButtonClick = () => {
    copy(shortcutLink);
    toast.success("Shortcut link copied to clipboard.");
  };

  return (
    <Card
      className={classNames(
        "group p-4 w-full flex flex-col justify-start items-start hover:shadow-md transition-shadow duration-200"
      )}
    >
      <div className="w-full flex flex-row justify-between items-center">
        <div className="w-[calc(100%-16px)] flex flex-row justify-start items-center mr-1 shrink-0">
          <Link
            className={classNames("w-8 h-8 flex justify-center items-center overflow-clip shrink-0 rounded")}
            to={`/shortcut/${shortcut.id}`}
            viewTransition
          >
            <LinkFavicon url={shortcut.link} />
          </Link>
          <div className="ml-3 w-[calc(100%-24px)] flex flex-col justify-start items-start">
            <div className="w-full flex flex-row justify-start items-center leading-tight">
              <a
                className={classNames(
                  "max-w-[calc(100%-36px)] flex flex-row justify-start items-center mr-1 hover:opacity-80 hover:underline transition-all"
                )}
                target="_blank"
                href={shortcutLink}
              >
                <div className="truncate">
                  <span className="text-foreground font-medium">{shortcut.title}</span>
                  {shortcut.title ? (
                    <span className="text-muted-foreground ml-1">({shortcut.name})</span>
                  ) : (
                    <span className="truncate text-foreground font-medium">{shortcut.name}</span>
                  )}
                </div>
                <span className="hidden group-hover:block ml-1 shrink-0">
                  <Icon.ExternalLink className="w-4 h-auto text-muted-foreground" />
                </span>
              </a>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="hidden group-hover:block text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => handleCopyButtonClick()}
                    >
                      <Icon.Clipboard className="w-4 h-auto" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <a
              className="pr-4 leading-tight w-full text-sm truncate text-muted-foreground hover:underline transition-all"
              href={shortcut.link}
              target="_blank"
            >
              {shortcut.link}
            </a>
          </div>
        </div>
        <div className="h-full pt-2 flex flex-row justify-end items-start">
          <ShortcutActionsDropdown shortcut={shortcut} />
        </div>
      </div>
      <div className="mt-3 w-full flex flex-row justify-start items-start gap-2 truncate">
        {shortcut.tags.map((tag) => {
          return (
            <Badge
              key={tag}
              variant="secondary"
              className="max-w-[8rem] truncate cursor-pointer hover:bg-secondary/80 transition-colors"
              onClick={() => viewStore.setFilter({ tag: tag })}
            >
              #{tag}
            </Badge>
          );
        })}
        {shortcut.tags.length === 0 && (
          <span className="text-muted-foreground text-sm italic">No tags</span>
        )}
      </div>
      <div className="w-full mt-3 flex gap-3 overflow-x-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {creator.nickname.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{creator.nickname}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="flex flex-row justify-start items-center gap-1 text-muted-foreground text-sm cursor-pointer hover:text-foreground transition-colors"
                onClick={() => viewStore.setFilter({ visibility: shortcut.visibility })}
              >
                <VisibilityIcon className="w-4 h-auto" visibility={shortcut.visibility} />
                {t(`shortcut.visibility.${shortcut.visibility.toLowerCase()}.self`)}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t(`shortcut.visibility.${shortcut.visibility.toLowerCase()}.description`)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className="flex flex-row justify-start items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors"
                to={`/shortcut/${shortcut.id}#analytics`}
                viewTransition
              >
                <Icon.BarChart2 className="w-4 h-auto" />
                {t("shortcut.visits", { count: shortcut.viewCount })}
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>View count</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </Card>
  );
};

export default ShortcutCard;
```

**Step 2: Update main.tsx to include Sonner Toaster**

Modify `frontend/web/src/main.tsx` - add Toaster component:
```typescript
import { Toaster } from "@/components/ui/sonner";

// Add before </React.StrictMode>
<Toaster />
```

**Step 3: Test in dev mode**

Run:
```bash
cd frontend/web
pnpm run dev
```

Expected: ShortcutCard renders with new shadcn components

**Step 4: Commit**

```bash
git add frontend/web/src/components/ShortcutCard.tsx frontend/web/src/main.tsx
git commit -m "refactor: migrate ShortcutCard to shadcn components"
```

---

### Task 22: Migrate CreateShortcutDrawer Component

**Files:**
- Modify: `frontend/web/src/components/CreateShortcutDrawer.tsx`

**Step 1: Replace MUI Drawer with shadcn Sheet**

Replace imports and component structure in `frontend/web/src/components/CreateShortcutDrawer.tsx`:
```typescript
import classnames from "classnames";
import { isUndefined, uniq } from "lodash-es";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import useLoading from "@/hooks/useLoading";
import { useShortcutStore, useWorkspaceStore } from "@/stores";
import { getShortcutUpdateMask } from "@/stores/shortcut";
import { Visibility } from "@/types/proto/api/v1/common";
import { Shortcut } from "@/types/proto/api/v1/shortcut_service";
import Icon from "./Icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Props {
  shortcutId?: number;
  initialShortcut?: Partial<Shortcut>;
  onClose: () => void;
  onConfirm?: () => void;
}

interface State {
  shortcutCreate: Shortcut;
}

const CreateShortcutDrawer: React.FC<Props> = (props: Props) => {
  const { onClose, onConfirm, shortcutId, initialShortcut } = props;
  const { t } = useTranslation();
  const [state, setState] = useState<State>({
    shortcutCreate: Shortcut.fromPartial({
      visibility: Visibility.WORKSPACE,
      ogMetadata: {
        title: "",
        description: "",
        image: "",
      },
      ...initialShortcut,
    }),
  });
  const shortcutStore = useShortcutStore();
  const workspaceStore = useWorkspaceStore();
  const [showOpenGraphMetadata, setShowOpenGraphMetadata] = useState<boolean>(false);
  const shortcutList = shortcutStore.getShortcutList();
  const [tag, setTag] = useState<string>("");
  const tagSuggestions = uniq(shortcutList.map((shortcut) => shortcut.tags).flat());
  const isCreating = isUndefined(shortcutId);
  const loadingState = useLoading(!isCreating);
  const requestState = useLoading(false);

  const setPartialState = (partialState: Partial<State>) => {
    setState({
      ...state,
      ...partialState,
    });
  };

  useEffect(() => {
    if (workspaceStore.setting.defaultVisibility !== Visibility.VISIBILITY_UNSPECIFIED) {
      setPartialState({
        shortcutCreate: Object.assign(state.shortcutCreate, {
          visibility: workspaceStore.setting.defaultVisibility,
        }),
      });
    }
  }, []);

  useEffect(() => {
    if (shortcutId) {
      const shortcut = shortcutStore.getShortcutById(shortcutId);
      if (shortcut) {
        setState({
          ...state,
          shortcutCreate: Object.assign(state.shortcutCreate, {
            name: shortcut.name,
            link: shortcut.link,
            title: shortcut.title,
            description: shortcut.description,
            visibility: shortcut.visibility,
            ogMetadata: shortcut.ogMetadata,
          }),
        });
        setTag(shortcut.tags.join(" "));
        loadingState.setFinish();
      }
    }
  }, [shortcutId]);

  if (loadingState.isLoading) {
    return null;
  }

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      shortcutCreate: Object.assign(state.shortcutCreate, {
        name: e.target.value.replace(/\s+/g, "-"),
      }),
    });
  };

  const handleLinkInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      shortcutCreate: Object.assign(state.shortcutCreate, {
        link: e.target.value,
      }),
    });
  };

  const handleTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      shortcutCreate: Object.assign(state.shortcutCreate, {
        title: e.target.value,
      }),
    });
  };

  const handleDescriptionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      shortcutCreate: Object.assign(state.shortcutCreate, {
        description: e.target.value,
      }),
    });
  };

  const handleTagsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setTag(text);
  };

  const handleOpenGraphMetadataImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      shortcutCreate: Object.assign(state.shortcutCreate, {
        ogMetadata: {
          ...state.shortcutCreate.ogMetadata,
          image: e.target.value,
        },
      }),
    });
  };

  const handleOpenGraphMetadataTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      shortcutCreate: Object.assign(state.shortcutCreate, {
        ogMetadata: {
          ...state.shortcutCreate.ogMetadata,
          title: e.target.value,
        },
      }),
    });
  };

  const handleOpenGraphMetadataDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPartialState({
      shortcutCreate: Object.assign(state.shortcutCreate, {
        ogMetadata: {
          ...state.shortcutCreate.ogMetadata,
          description: e.target.value,
        },
      }),
    });
  };

  const handleTagSuggestionsClick = (suggestion: string) => {
    if (tag === "") {
      setTag(suggestion);
    } else {
      setTag(`${tag} ${suggestion}`);
    }
  };

  const handleSaveBtnClick = async () => {
    if (!state.shortcutCreate.name || !state.shortcutCreate.link) {
      toast.error("Please fill in required fields.");
      return;
    }

    try {
      requestState.setLoading();
      const tags = tag.split(" ").filter(Boolean);
      if (shortcutId) {
        const originShortcut = shortcutStore.getShortcutById(shortcutId);
        const updatingShortcut = {
          ...state.shortcutCreate,
          id: shortcutId,
          tags,
        };
        await shortcutStore.updateShortcut(updatingShortcut, getShortcutUpdateMask(originShortcut, updatingShortcut));
      } else {
        await shortcutStore.createShortcut({
          ...state.shortcutCreate,
          tags,
        });
      }

      requestState.setFinish();
      if (onConfirm) {
        onConfirm();
      } else {
        onClose();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.details || "An error occurred");
      requestState.setFinish();
    }
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isCreating ? "Create Shortcut" : "Edit Shortcut"}</SheetTitle>
          <SheetDescription>
            {isCreating ? "Create a new shortcut" : "Edit your shortcut details"}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">s/</span>
              <Input
                id="name"
                type="text"
                placeholder="An easy name to remember"
                value={state.shortcutCreate.name}
                onChange={handleNameInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">
              Link <span className="text-destructive">*</span>
            </Label>
            <Input
              id="link"
              type="text"
              placeholder="The destination link of the shortcut"
              value={state.shortcutCreate.link}
              onChange={handleLinkInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="The title of the shortcut"
              value={state.shortcutCreate.title}
              onChange={handleTitleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              type="text"
              placeholder="A short description of the shortcut"
              value={state.shortcutCreate.description}
              onChange={handleDescriptionInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              type="text"
              placeholder="The tags of shortcut"
              value={tag}
              onChange={handleTagsInputChange}
            />
            {tagSuggestions.length > 0 && (
              <div className="flex flex-row items-start gap-2 mt-2">
                <Icon.Asterisk className="w-4 h-auto shrink-0 mt-0.5 text-muted-foreground" />
                <div className="flex flex-row flex-wrap gap-2">
                  {tagSuggestions.map((tag) => (
                    <span
                      className="text-muted-foreground cursor-pointer text-sm hover:text-foreground transition-colors"
                      key={tag}
                      onClick={() => handleTagSuggestionsClick(tag)}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="public"
              checked={state.shortcutCreate.visibility === Visibility.PUBLIC}
              onCheckedChange={(checked) =>
                setPartialState({
                  shortcutCreate: Object.assign(state.shortcutCreate, {
                    visibility: checked ? Visibility.PUBLIC : Visibility.WORKSPACE,
                  }),
                })
              }
            />
            <Label htmlFor="public" className="text-sm font-normal cursor-pointer">
              {t(`shortcut.visibility.public.description`)}
            </Label>
          </div>

          <Separator className="my-4" />

          <div className="border rounded-lg overflow-hidden">
            <div
              className={classnames(
                "flex flex-row justify-between items-center px-3 py-2 cursor-pointer hover:bg-accent transition-colors",
                showOpenGraphMetadata && "bg-accent border-b"
              )}
              onClick={() => setShowOpenGraphMetadata(!showOpenGraphMetadata)}
            >
              <span className="text-sm flex items-center gap-1">
                Social media metadata
                <Icon.Sparkles className="w-4 h-auto text-primary" />
              </span>
              <Icon.ChevronDown
                className={classnames(
                  "w-4 h-auto text-muted-foreground transition-transform",
                  showOpenGraphMetadata && "rotate-180"
                )}
              />
            </div>
            {showOpenGraphMetadata && (
              <div className="p-3 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="og-image" className="text-sm">
                    Image URL
                  </Label>
                  <Input
                    id="og-image"
                    type="text"
                    placeholder="https://the.link.to/the/image.png"
                    value={state.shortcutCreate.ogMetadata?.image}
                    onChange={handleOpenGraphMetadataImageChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="og-title" className="text-sm">
                    Title
                  </Label>
                  <Input
                    id="og-title"
                    type="text"
                    placeholder="Slash - An open source, self-hosted platform"
                    value={state.shortcutCreate.ogMetadata?.title}
                    onChange={handleOpenGraphMetadataTitleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="og-description" className="text-sm">
                    Description
                  </Label>
                  <Textarea
                    id="og-description"
                    placeholder="An open source, self-hosted platform for sharing and managing your most frequently used links."
                    rows={3}
                    value={state.shortcutCreate.ogMetadata?.description}
                    onChange={handleOpenGraphMetadataDescriptionChange}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={requestState.isLoading}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSaveBtnClick}
            disabled={requestState.isLoading}
          >
            {requestState.isLoading ? "Saving..." : t("common.save")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CreateShortcutDrawer;
```

**Step 2: Commit**

```bash
git add frontend/web/src/components/CreateShortcutDrawer.tsx
git commit -m "refactor: migrate CreateShortcutDrawer to shadcn sheet"
```

---

## Phase 5: Polish & Enhancement

### Task 23: Install Framer Motion for Animations

**Files:**
- Modify: `frontend/web/package.json`

**Step 1: Install framer-motion**

Run:
```bash
cd frontend/web
pnpm add framer-motion
```

Expected: framer-motion installed

**Step 2: Commit**

```bash
git add frontend/web/package.json frontend/web/pnpm-lock.yaml
git commit -m "feat: add framer-motion for animations"
```

---

### Task 24: Create Animated Card Wrapper

**Files:**
- Create: `frontend/web/src/components/ui/animated-card.tsx`

**Step 1: Create animated card component**

Create `frontend/web/src/components/ui/animated-card.tsx`:
```typescript
import { motion } from "framer-motion";
import { Card, CardProps } from "@/components/ui/card";
import { forwardRef } from "react";

const AnimatedCard = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        whileHover={{ y: -2 }}
      >
        <Card ref={ref} className={className} {...props}>
          {children}
        </Card>
      </motion.div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";

export { AnimatedCard };
```

**Step 2: Update ShortcutCard to use AnimatedCard**

Update `frontend/web/src/components/ShortcutCard.tsx` - replace `Card` with `AnimatedCard`:
```typescript
import { AnimatedCard } from "@/components/ui/animated-card";

// In the component, replace:
<Card className={...}>
// with:
<AnimatedCard className={...}>
```

**Step 3: Commit**

```bash
git add frontend/web/src/components/ui/animated-card.tsx frontend/web/src/components/ShortcutCard.tsx
git commit -m "feat: add animated card with framer motion"
```

---

### Task 25: Improve Typography and Spacing

**Files:**
- Modify: `frontend/web/src/css/index.css`

**Step 1: Add improved typography styles**

Append to `frontend/web/src/css/index.css`:
```css
@layer base {
  h1 {
    @apply text-4xl font-bold tracking-tight;
  }
  h2 {
    @apply text-3xl font-semibold tracking-tight;
  }
  h3 {
    @apply text-2xl font-semibold tracking-tight;
  }
  h4 {
    @apply text-xl font-semibold tracking-tight;
  }
  p {
    @apply leading-7;
  }
}
```

**Step 2: Verify styles apply**

Run:
```bash
cd frontend/web
pnpm run dev
```

Expected: Typography looks more refined

**Step 3: Commit**

```bash
git add frontend/web/src/css/index.css
git commit -m "feat: improve typography with consistent styles"
```

---

## Phase 6: Complete Migration

### Task 26: Migrate Remaining Components

**Files:**
- Modify: Various component files

**Step 1: Find all remaining MUI Joy imports**

Run:
```bash
cd frontend/web
grep -r "@mui/joy" src/ --include="*.tsx" --include="*.ts" | cut -d: -f1 | sort | uniq
```

Expected: List of files still using MUI Joy

**Step 2: Create migration checklist**

Document all files that need migration for systematic replacement

**Step 3: Migrate each file one by one**

For each file:
- Replace MUI Joy imports with shadcn equivalents
- Update component usage
- Test functionality
- Commit

**Mapping:**
- `Button` → `@/components/ui/button`
- `Input` → `@/components/ui/input`
- `Modal`, `ModalDialog` → `@/components/ui/dialog`
- `Drawer` → `@/components/ui/sheet`
- `Checkbox` → `@/components/ui/checkbox`
- `Textarea` → `@/components/ui/textarea`
- `Divider` → `@/components/ui/separator`
- `Avatar` → `@/components/ui/avatar`
- `Tooltip` → `@/components/ui/tooltip`

---

### Task 27: Remove MUI Joy Dependencies

**Files:**
- Modify: `frontend/web/package.json`

**Step 1: Verify no MUI Joy imports remain**

Run:
```bash
cd frontend/web
grep -r "@mui/joy" src/ --include="*.tsx" --include="*.ts"
```

Expected: No results (or list what's left to migrate)

**Step 2: Remove MUI Joy packages**

Run:
```bash
cd frontend/web
pnpm remove @mui/joy @emotion/react @emotion/styled
```

Expected: Packages removed

**Step 3: Remove react-hot-toast (replaced with sonner)**

Run:
```bash
cd frontend/web
pnpm remove react-hot-toast
```

Expected: Package removed

**Step 4: Verify app still builds**

Run:
```bash
cd frontend/web
pnpm run build
```

Expected: Build succeeds

**Step 5: Commit**

```bash
git add frontend/web/package.json frontend/web/pnpm-lock.yaml
git commit -m "chore: remove MUI Joy and react-hot-toast dependencies"
```

---

### Task 28: Final Testing and QA

**Files:**
- None

**Step 1: Run dev server and test all features**

Run:
```bash
cd frontend/web
pnpm run dev
```

Test:
- ✅ Create shortcut drawer opens and functions
- ✅ Shortcut cards render correctly
- ✅ Buttons work and have proper hover states
- ✅ Modals/dialogs open and close
- ✅ Forms submit properly
- ✅ Dark mode works correctly
- ✅ Tooltips show on hover
- ✅ Dropdowns function
- ✅ Animations are smooth

**Step 2: Run production build**

Run:
```bash
cd frontend/web
pnpm run build
pnpm run serve
```

Expected: Production build works, no console errors

**Step 3: Check bundle size**

Run:
```bash
cd frontend/web
ls -lh dist/assets/
```

Expected: Bundle size is reasonable (should be smaller without MUI Joy)

---

### Task 29: Documentation

**Files:**
- Create: `frontend/web/docs/ui-components.md`

**Step 1: Create component documentation**

Create `frontend/web/docs/ui-components.md`:
```markdown
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

\`\`\`bash
cd frontend/web
npx shadcn@latest add [component-name]
\`\`\`

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
```

**Step 2: Commit**

```bash
git add frontend/web/docs/ui-components.md
git commit -m "docs: add UI components guide"
```

---

### Task 30: Final Commit and Summary

**Files:**
- None

**Step 1: Review all changes**

Run:
```bash
git log --oneline | head -30
```

Expected: See all migration commits

**Step 2: Create summary commit**

```bash
git commit --allow-empty -m "feat: complete migration from MUI Joy to shadcn/ui

- Migrated all UI components to shadcn/ui
- Implemented clean & minimal design aesthetic
- Added Framer Motion for subtle animations
- Improved typography and spacing consistency
- Enhanced dark mode with proper color palette
- Replaced react-hot-toast with sonner
- Removed MUI Joy dependencies
- Updated all forms, modals, and interactive components
- Added component documentation

This migration improves maintainability, reduces bundle size, and provides a more modern, polished UI."
```

---

## Notes for Implementation

**DRY Principle:**
- Reuse shadcn components across the app
- Use the `cn()` utility consistently
- Create custom wrappers (like AnimatedCard) for common patterns

**YAGNI Principle:**
- Only install shadcn components you actually need
- Don't add animations everywhere - be selective
- Keep it simple and focused

**TDD Where Applicable:**
- Test forms still submit correctly
- Test modals open/close properly
- Test component interactions
- Manual testing is primary method here (UI-heavy work)

**Frequent Commits:**
- Commit after each component installation
- Commit after each file migration
- Makes rollback easy if issues arise

**Testing Strategy:**
- Manual testing in dev mode after each migration
- Final comprehensive test before removing MUI Joy
- Production build test to verify everything works

**Risk Mitigation:**
- Keep backups of modified files (*.backup)
- Test frequently during migration
- One component type at a time
- Can run both systems side-by-side temporarily

---

## Estimated Effort

- **Phase 1 (Setup)**: 30 minutes
- **Phase 2 (Core components)**: 45 minutes
- **Phase 3 (Complex components)**: 45 minutes
- **Phase 4 (App components)**: 2-3 hours
- **Phase 5 (Polish)**: 1 hour
- **Phase 6 (Complete)**: 1-2 hours

**Total**: ~6-8 hours for complete migration

**Note**: This is a comprehensive plan. Execution can be done in batches with review checkpoints.