/**
 * Font Configuration
 *
 * This file centralizes all font settings for the application.
 * Change fonts here to update the entire application typography.
 *
 * HOW TO CHANGE FONTS:
 *
 * ✅ THIS FILE IS NOW THE SINGLE SOURCE OF TRUTH FOR ALL FONTS!
 *
 * To change fonts:
 * 1. Open this file (lib/fonts.ts)
 * 2. Update the font family names below
 * 3. The changes will automatically apply to:
 *    - All text throughout the application
 *    - Headers, paragraphs, buttons, inputs
 *    - All UI components
 *
 * EXAMPLE: To change primary font from "Zalando Sans SemiExpanded" to "Arial":
 *   Change: primary: "Zalando Sans SemiExpanded" to primary: "Arial"
 *
 * The FontProvider component automatically injects these values as CSS variables
 * at runtime, making this file the single source of truth for the entire application.
 */

export const fonts = {
  // primary: "Sansation" - Main font for all text
  // Used in: All body text, headings, buttons, inputs, cards, navigation, etc.
  // This font is loaded via Google Fonts
  primary: "Sansation",

  // fallback: "Arial, Helvetica, sans-serif" - Fallback fonts if primary font fails to load
  // Used in: Font stack fallback for all text
  fallback: "Arial, Helvetica, sans-serif",

  // mono: "Courier New, monospace" - Monospace font for code/technical content
  // Used in: Code blocks, technical displays, monospace text
  mono: "Courier New, monospace",
} as const;

/**
 * Get the complete font family string
 * @param fontType - Type of font (primary, mono)
 * @returns Complete font family string with fallbacks
 */
export function getFontFamily(fontType: "primary" | "mono" = "primary"): string {
  if (fontType === "mono") {
    return `${fonts.mono}, ${fonts.fallback}`;
  }
  return `${fonts.primary}, ${fonts.fallback}`;
}

