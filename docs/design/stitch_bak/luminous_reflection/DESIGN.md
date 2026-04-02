```markdown
# The Design System: Reflective Clarity

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Curator"**

This design system is not a utility; it is an archive. The objective is to move away from the "busy" nature of productivity tools and toward a high-end editorial experience that feels like a quiet gallery space. We achieve this through **Reflective Clarity**—a concept that uses transparency, generous white space, and intentional asymmetry to invite reflection.

To break the "template" look, we avoid rigid grids. Layouts should utilize **weighted asymmetry**, where large editorial typography (`display-lg`) is balanced by deep "negative space" buffers. Elements should feel like they are floating on a fluid surface rather than locked into a cage.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule

The palette is rooted in a cool, airy spectrum that prioritizes atmospheric depth over structural rigidity.

### Color Strategy
- **Primary (`#006a63` / `#55d2c6`):** Our Mint accent. It is the "Pulse" of the archive. Use it sparingly for intent and action.
- **Surface Layering:** We utilize the `surface-container` tiers to create a sense of physical stacking. 
- **The "No-Line" Rule:** **Strictly prohibit 1px solid borders for sectioning.** Boundaries must be defined through background shifts (e.g., a `surface-container-low` card resting on a `surface` background). If you feel the need for a line, use space instead.

### Signature Textures
- **The Glass Effect:** For floating navigation or modals, use `surface-container-lowest` at 80% opacity with a `20px` backdrop-blur. This ensures the "Archive" feels interconnected.
- **Reflective Gradients:** CTAs should not be flat. Apply a subtle linear gradient from `primary` (`#006a63`) to `primary-container` (`#55d2c6`) at a 135-degree angle to provide a "gemstone" polish.

---

## 3. Typography: Editorial Authority

We pair **Manrope** (Expression) with **Inter** (Utility) to create a sophisticated, curated hierarchy.

- **The Expression Layer (Manrope):** Used for `display` and `headline` roles. This is your "voice." Use `display-lg` (3.5rem) with tighter letter-spacing (-0.02em) to create an authoritative, editorial feel.
- **The Utility Layer (Inter):** Used for `title`, `body`, and `label`. Inter’s x-height provides maximum readability for the "excuses" or "data" being archived.
- **Visual Weight:** Contrast a `headline-lg` (Manrope, Bold) with a `body-md` (Inter, Regular, `on-surface-variant`). The tension between the large serif-like personality of Manrope and the clean Swiss-style of Inter creates a "Premium Journal" aesthetic.

---

## 4. Elevation & Depth: The Layering Principle

In this system, depth is a result of light and shadow, not lines.

- **Stacking Tiers:** Instead of shadows, use color.
    - **Base:** `surface` (`#f7f9fe`)
    - **Section:** `surface-container-low` (`#f1f4f9`)
    - **Card:** `surface-container-lowest` (`#ffffff`)
- **Ambient Shadows:** When an object must float (like a FAB or Pop-over), use a "Cloud Shadow": 
    - `Box-shadow: 0 12px 40px rgba(24, 28, 32, 0.06);` 
    - Never use pure black shadows. The shadow must be tinted with the `on-surface` color at a very low opacity.
- **The "Ghost Border":** If accessibility requires a container edge, use the `outline-variant` token at **15% opacity**. It should be felt, not seen.

---

## 5. Components: Fluid Primitives

### Cards & Surfaces
- **Rules:** No borders. No dividers.
- **Rounding:** Apply `xl` (1.5rem / 24px) for main containers and `lg` (1rem / 16px) for nested content.
- **Spacing:** Use `spacing-6` (2rem) as the default internal padding to ensure "Airy" clarity.

### The Heatmap (Archive Activity)
- **Empty State:** Use `heatmap-empty` (`#E2E8F0`). 
- **Active State:** Transition from `primary-fixed-dim` to `primary` based on density.
- **Form:** Use `rounded-sm` (0.25rem) for heatmap cells to maintain a clean, technical grid within the soft UI.

### Buttons
- **Primary:** Gradient fill (Mint), `full` rounding (pill-shape).
- **Secondary:** `surface-container-high` background with `on-surface` text. No border.
- **Tertiary:** Ghost style. Use `primary` text with a subtle `background` shift on hover.

### Input Fields
- **Surface:** `surface-container-low` (`#f1f4f9`).
- **Interaction:** On focus, transition the background to `surface-container-lowest` (#ffffff) and apply a 2px `ghost-border` using the `primary` color at 30% opacity.

---

## 6. Do’s and Don'ts

### Do:
- **Embrace White Space:** If a layout feels crowded, double the padding. 
- **Use Asymmetric Grids:** Offset your headlines to the left while keeping body text centered to create an editorial "magazine" flow.
- **Nesting depth:** Place `surface-container-lowest` items inside `surface-container-high` sections for maximum "lift."

### Don't:
- **Never use 1px Dividers:** Use `spacing-8` or a subtle background color change to separate list items.
- **Avoid High Contrast Borders:** Black or dark grey borders kill the "Reflective Clarity" concept.
- **Don't Over-shadow:** If everything has a shadow, nothing is elevated. Rely on tonal layering first.
- **No Sharp Corners:** This system is "Reflective and Soft." Avoid the `none` or `sm` roundness tokens for anything larger than a checkbox.

---

## 7. Signature Archive Components

- **The Reflection Header:** A `display-sm` headline that uses a subtle vertical gradient (from `on-surface` to `on-surface-variant`) to mimic the way light hits a printed page.
- **Glass-Morph Sticky Nav:** A top navigation bar using `surface-container-lowest` at 70% opacity with a heavy `backdrop-filter: blur(12px)`. It creates a sense that the archive content is sliding underneath a sheet of frosted glass.