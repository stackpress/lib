# @stackpress/lib Docs Creative Draft - Round 2

This is a static creative design-review artifact based on the approved
wireframes plus the user-requested Queue page and light/dark mode. It is not
production site code.

## Direction

The design keeps the approved reference-hub structure and applies a restrained
Stackpress visual system:

- blue Stackpress brand accents
- light and dark mode tokens
- white/pale-blue reading surfaces in light mode
- dark navy reading surfaces in dark mode
- dark code blocks for developer scanning
- fixed desktop API rail
- calm article pages
- clearer top actions: theme toggle, `GitHub`, and `npm`

## Pages

- `index.html` - reference hub homepage
- `events.html` - Events category page
- `system.html` - System category page
- `data.html` - Data category page
- `routing.html` - Routing category page
- `queue.html` - Queue category page
- `api-reference.html` - representative API article page
- `mobile-nav.html` - explicit mobile drawer state

## Simulated Behavior

- The `Dark` / `Light` button switches the review artifact between light and
  dark mode and persists the selected mode in local storage.
- The mobile menu button opens the review-only mobile page nav.

## Review Questions

- Does the dark mode feel like the same Stackpress system, not a separate
  theme?
- Is the Queue page in the right place in the navigation and homepage secondary
  API area?
- Are the light and dark code blocks, cards, tables, and sidebars readable?
- Should Queue remain secondary visually, or should it be promoted nearer to the
  four primary lanes?

## Approval Path

If this creative round is approved, the next step is a creative handoff before
production implementation. If not, revise the named visual decisions, page
placement, or dark-mode treatment first.
