/**
 * Theme Configuration
 *
 * This file centralizes all theme colors for the application.
 * Change colors here to update the entire application theme.
 *
 * HOW TO CHANGE THEME COLORS:
 *
 * ✅ THIS FILE IS NOW THE SINGLE SOURCE OF TRUTH FOR ALL COLORS!
 *
 * To change theme colors:
 * 1. Open this file (lib/theme.ts)
 * 2. Update the color values in the theme object below (e.g., primary: "#000000")
 * 3. The changes will automatically apply to:
 *    - All buttons (primary, secondary, accent colors)
 *    - All card headers and footers
 *    - Header and sidebar navigation
 *    - All status indicators (success, error, warning, info)
 *    - Calendar status colors
 *    - All UI components using theme variables
 *
 * EXAMPLE: To change primary color from black to blue:
 *   Change: primary: "#000000" to primary: "#2563eb"
 *
 * The ThemeProvider component automatically injects these values as CSS variables
 * at runtime, making this file the single source of truth for the entire application.
 */

export const theme = {
  // ============================================
  // PRIMARY COLORS (Main Brand Color - Black)
  // ============================================

  // primary: "#000000" - Pure black
  // Used in: Header background, primary buttons (Post, Wish, Submit buttons), active sidebar items,
  //          progress bars, links ("Go to calendar", "See more"), calendar selected dates,
  //          punch in button, all default button variants
  primary: "#000000",

  // primaryForeground: "#ffffff" - Pure white
  // Used in: Text on primary buttons, text on header, text on active sidebar items,
  //          text on black backgrounds, icon colors on primary elements
  primaryForeground: "#ffffff",

  // primaryHover: "#1a1a1a" - Dark gray (slightly lighter than black)
  // Used in: Hover states for primary buttons, hover states for links with primary color
  primaryHover: "#1a1a1a",

  // primaryLight: "#f5f5f5" - Very light gray
  // Used in: Light backgrounds for primary elements, accent light backgrounds,
  //          feed post type badges ("Welcome post" tags), avatar backgrounds with primary tint
  primaryLight: "#f5f5f5",

  // ============================================
  // SECONDARY COLORS
  // ============================================

  // secondary: "#e5e5e5" - Light gray
  // Used in: Secondary button backgrounds, secondary UI elements
  secondary: "#e5e5e5",

  // secondaryForeground: "#171717" - Very dark gray (almost black)
  // Used in: Text on secondary elements, main text color throughout the app
  secondaryForeground: "#171717",

  // ============================================
  // ACCENT COLORS (Changed from green to black)
  // ============================================

  // accent: "#000000" - Pure black (same as primary)
  // Used in: Accent buttons, hover states for outline/ghost buttons,
  //          active states in sidebar favorites/requests sections
  accent: "#000000",

  // accentForeground: "#ffffff" - Pure white
  // Used in: Text on accent elements, text on accent buttons
  accentForeground: "#ffffff",

  // accentLight: "#f5f5f5" - Very light gray
  // Used in: Light accent backgrounds, active sidebar item backgrounds (favorites/requests),
  //          feed post type badge backgrounds
  accentLight: "#f5f5f5",

  // ============================================
  // BACKGROUND COLORS (Dark Theme)
  // ============================================

  // background: "#0f0f0f" - Very dark gray/black
  // Used in: Main page background, body background, overall app background
  background: "#0f0f0f",

  // foreground: "#ffffff" - White
  // Used in: Primary text color, main content text, headings, card text
  foreground: "#ffffff",

  // ============================================
  // CARD COLORS (Dark Theme)
  // ============================================

  // card: "#1a1a1a" - Dark gray
  // Used in: Card backgrounds, all card components (Feed cards, celebration cards,
  //          inbox cards, calendar cards, leave balance cards, etc.)
  card: "#1a1a1a",

  // cardForeground: "#ffffff" - White
  // Used in: Text inside cards, card titles, card content text
  cardForeground: "#ffffff",

  // ============================================
  // MUTED COLORS (Dark Theme)
  // ============================================

  // muted: "#2a2a2a" - Dark gray
  // Used in: Muted backgrounds, hover states for sidebar items, progress bar backgrounds,
  //          celebration card item backgrounds, leave balance card backgrounds,
  //          search input backgrounds, disabled states
  muted: "#2a2a2a",

  // mutedForeground: "#a0a0a0" - Light gray
  // Used in: Secondary text, muted text, helper text, timestamps, descriptions,
  //          "Hope you are having a great day" text, employee role text
  mutedForeground: "#a0a0a0",

  // ============================================
  // BORDER COLORS (Dark Theme)
  // ============================================

  // border: "#333333" - Dark gray
  // Used in: Card borders, input borders, general borders throughout the app,
  //          sidebar border, divider lines
  border: "#333333",

  // input: "#333333" - Dark gray (same as border)
  // Used in: Input field borders, search input borders, form input borders
  input: "#333333",

  // ============================================
  // STATUS COLORS (Semantic Colors)
  // ============================================

  // success: "#000000" - Pure black (changed from green)
  // Used in: Success toast icons, completed goal checkmarks, approved letter checkmarks,
  //          present days count in attendance, remaining leave balance text,
  //          monthly net salary in CTC page, earnings trending up icon
  success: "#000000",

  // successBackground: "#f5f5f5" - Very light gray
  // Used in: Success message backgrounds, present days summary card background in attendance page
  successBackground: "#f5f5f5",

  // error: "#dc2626" - Red
  // Used in: Error toast icons, rejected letter X icons, absent days count,
  //          error states, destructive button variants
  error: "#dc2626",

  // errorBackground: "#fee2e2" - Light red/pink
  // Used in: Error message backgrounds, absent days summary card background
  errorBackground: "#fee2e2",

  // warning: "#d97706" - Orange
  // Used in: Warning toast icons, pending letter clock icons, leave days count,
  //          used leave balance text
  warning: "#d97706",

  // warningBackground: "#fef3c7" - Light yellow
  // Used in: Warning message backgrounds, leave days summary card background
  warningBackground: "#fef3c7",

  // info: "#2563eb" - Blue
  // Used in: Info toast icons, in-progress goal clock icons, general info states
  info: "#2563eb",

  // infoBackground: "#dbeafe" - Light blue
  // Used in: Info message backgrounds, info state backgrounds
  infoBackground: "#dbeafe",

  // ============================================
  // CALENDAR STATUS COLORS
  // ============================================

  calendar: {
    // today: "#2563eb" - Blue
    // Used in: Calendar - today's date highlight, today indicator dot in calendar legend
    today: "#2563eb",

    // present: "#ffffff" - White
    // Used in: Calendar - present status indicator dot, present indicator in calendar legend
    present: "#ffffff",

    // absent: "#dc2626" - Red
    // Used in: Calendar - absent status indicator dot, absent indicator in calendar legend
    absent: "#dc2626",

    // leave: "#d97706" - Orange
    // Used in: Calendar - leave status indicator dot, leave indicator in calendar legend
    leave: "#d97706",

    // holiday: "#9333ea" - Purple
    // Used in: Calendar - holiday status indicator dot, holiday indicator in calendar legend
    holiday: "#9333ea",

    // onDuty: "#2563eb" - Blue
    // Used in: Calendar - on duty status indicator dot
    onDuty: "#2563eb",
  },

  // ============================================
  // BUTTON COLORS
  // ============================================

  button: {
    default: {
      // background: "#000000" - Pure black
      // Used in: Default button background (Post, Wish, Submit, New Goal buttons)
      background: "#000000",

      // foreground: "#ffffff" - Pure white
      // Used in: Default button text color
      foreground: "#ffffff",

      // hover: "#1a1a1a" - Dark gray
      // Used in: Default button hover state background
      hover: "#1a1a1a",
    },
    outline: {
      // background: "transparent" - Transparent
      // Used in: Outline button background (Badge, Reward, Schedule 1-on-1 buttons)
      background: "transparent",

      // foreground: "#171717" - Very dark gray
      // Used in: Outline button text color
      foreground: "#171717",

      // border: "#e5e7eb" - Light gray
      // Used in: Outline button border color
      border: "#e5e7eb",

      // hover: "#f5f5f5" - Very light gray
      // Used in: Outline button hover state background
      hover: "#f5f5f5",
    },
    ghost: {
      // background: "transparent" - Transparent
      // Used in: Ghost button background (Clap, Comment buttons in feed)
      background: "transparent",

      // foreground: "#171717" - Very dark gray
      // Used in: Ghost button text color
      foreground: "#171717",

      // hover: "#f5f5f5" - Very light gray
      // Used in: Ghost button hover state background
      hover: "#f5f5f5",
    },
    link: {
      // foreground: "#000000" - Pure black
      // Used in: Link button text color ("Go to calendar", "See more" links)
      foreground: "#000000",

      // hover: "#1a1a1a" - Dark gray
      // Used in: Link button hover state text color
      hover: "#1a1a1a",
    },
  },

  // ============================================
  // HEADER COLORS
  // ============================================

  header: {
    // background: "#0a0a0a" - Very dark gray/black
    // Used in: Top header/navigation bar background (Kodix logo area)
    background: "#0a0a0a",

    // foreground: "#ffffff" - Pure white
    // Used in: Header text color, header icon colors, company name text
    foreground: "#ffffff",

    // searchBackground: "#1a1a1a" - Dark gray
    // Used in: Search input background in header
    searchBackground: "#1a1a1a",

    // searchForeground: "#ffffff" - Pure white
    // Used in: Search input text color, search placeholder text color
    searchForeground: "#ffffff",
  },

  // ============================================
  // SIDEBAR COLORS (Dark Theme)
  // ============================================

  sidebar: {
    // background: "#1a1a1a" - Dark gray
    // Used in: Sidebar background, sidebar card backgrounds
    background: "#1a1a1a",

    // foreground: "#ffffff" - White
    // Used in: Sidebar text color, sidebar navigation item text
    foreground: "#ffffff",

    // activeBackground: "#2563eb" - Blue (gradient can be applied)
    // Used in: Active sidebar navigation item background (Home, Inbox when active)
    activeBackground: "#2563eb",

    // activeForeground: "#ffffff" - Pure white
    // Used in: Active sidebar navigation item text color
    activeForeground: "#ffffff",

    // hoverBackground: "#2a2a2a" - Dark gray
    // Used in: Sidebar item hover state background, inactive sidebar items on hover
    hoverBackground: "#2a2a2a",

    // border: "#333333" - Dark gray
    // Used in: Sidebar right border, sidebar divider lines
    border: "#333333",
  },

  // ============================================
  // CARD HEADER COLORS
  // ============================================

  cardHeader: {
    // background: "#ffffff" - Pure white
    // Used in: Card header background (all card titles)
    background: "#ffffff",

    // foreground: "#171717" - Very dark gray
    // Used in: Card header text color, card titles ("Today's celebration", "Feed", "Inbox", etc.)
    foreground: "#171717",
  },

  // ============================================
  // FOOTER COLORS (If needed in future)
  // ============================================

  footer: {
    // background: "#ffffff" - Pure white
    // Used in: Footer background (if footer component is added)
    background: "#ffffff",

    // foreground: "#171717" - Very dark gray
    // Used in: Footer text color (if footer component is added)
    foreground: "#171717",

    // border: "#e5e7eb" - Light gray
    // Used in: Footer top border (if footer component is added)
    border: "#e5e7eb",
  },
} as const;

/**
 * Export CSS variables string for use in globals.css
 */
export const themeToCSSVars = () => {
  return `
    --background: ${theme.background};
    --foreground: ${theme.foreground};
    --primary: ${theme.primary};
    --primary-foreground: ${theme.primaryForeground};
    --primary-hover: ${theme.primaryHover};
    --primary-light: ${theme.primaryLight};
    --secondary: ${theme.secondary};
    --secondary-foreground: ${theme.secondaryForeground};
    --accent: ${theme.accent};
    --accent-foreground: ${theme.accentForeground};
    --accent-light: ${theme.accentLight};
    --muted: ${theme.muted};
    --muted-foreground: ${theme.mutedForeground};
    --border: ${theme.border};
    --input: ${theme.input};
    --card: ${theme.card};
    --card-foreground: ${theme.cardForeground};
    --success: ${theme.success};
    --success-background: ${theme.successBackground};
    --error: ${theme.error};
    --error-background: ${theme.errorBackground};
    --warning: ${theme.warning};
    --warning-background: ${theme.warningBackground};
    --info: ${theme.info};
    --info-background: ${theme.infoBackground};
    --calendar-today: ${theme.calendar.today};
    --calendar-present: ${theme.calendar.present};
    --calendar-absent: ${theme.calendar.absent};
    --calendar-leave: ${theme.calendar.leave};
    --calendar-holiday: ${theme.calendar.holiday};
    --calendar-on-duty: ${theme.calendar.onDuty};
  `;
};
