# How to Resume - Quick Start for New Sessions

**Get Claude up to speed in 30 seconds**

---

## 🚀 Starting a New Session

### Copy-Paste This:

```
Hi Claude! Let's continue building Thiam Dashboard.

Please read these files for context:
1. SESSION_NOTES.md - Current state & progress
2. CHANGELOG.md - What changed recently
3. ROUTING_STRATEGY.md - URL structure
4. ARCHITECTURE.md - System design

Today we're working on: [DESCRIBE WHAT YOU WANT TO BUILD]

Reference the Request domain (src/components/domains/requests/)
as the pattern to follow.

Note: If commands are slow, check CLAUDE_CLI_SETUP.md for permission setup.
```

---

## 📋 What Claude Needs to Know

### Minimal Context (30 seconds)
Just say:
> "Continue Thiam Dashboard. Read SESSION_NOTES.md. We're building [feature]."

### Full Context (2 minutes)
```
We're building Thiam Dashboard - a DDD-based catering platform.

Foundation is complete:
- Type-safe API client (src/lib/api/)
- 9 domains (requests, offers, orders, invoices, payments, caterers, customers, menus, deliveries)
- Request domain is the reference implementation
- Full routing strategy defined (ROUTING_STRATEGY.md)

Today: [what you want to build]

Follow the patterns in:
- src/components/domains/requests/ (reference)
- CODING_GUIDELINES.md (templates)
- ARCHITECTURE.md (principles)
```

---

## 🎯 Common Session Types

### Building a New Feature

```
Continue Thiam Dashboard. Read SESSION_NOTES.md.

Today we're building: [Feature Name]
Domain: [which domain - requests, offers, etc.]
User type: [customer, caterer, ops, finance, sales]

Steps:
1. Create components following Request domain pattern
2. Use API hooks from src/lib/api/hooks.ts
3. Add validation with Zod
4. Export through domain's index.ts

Let's start with: [specific component, e.g., RequestList]
```

### Fixing a Bug

```
Continue Thiam Dashboard. Read SESSION_NOTES.md.

Bug: [description]
Location: [file path if known]
Expected: [what should happen]
Actual: [what's happening]

Let's debug this.
```

### Refactoring

```
Continue Thiam Dashboard. Read SESSION_NOTES.md.

Refactor: [what needs refactoring]
Current location: [file path]
Goal: [what should improve]

Follow DDD principles from ARCHITECTURE.md.
```

### Adding Documentation

```
Continue Thiam Dashboard. Read SESSION_NOTES.md.

Document: [what needs documentation]
Audience: [who will read this]

Follow the style in existing docs (ARCHITECTURE.md, etc.)
```

---

## 📁 Key Files Reference

### Always Have These Open

1. **SESSION_NOTES.md** - What's done, what's next, decisions made
2. **CHANGELOG.md** - What changed in each session
3. **ROUTING_STRATEGY.md** - All URL patterns
4. **ARCHITECTURE.md** - System design principles

### When Writing Code

5. **CODING_GUIDELINES.md** - Templates for every pattern
6. **src/components/domains/requests/** - Reference implementation
7. **src/lib/api/hooks.ts** - Available API hooks
8. **src/lib/api/examples.tsx** - Working code examples

### When Starting a New Domain

9. **QUICKSTART.md** - Step-by-step guide
10. **src/components/domains/requests/types/request.types.ts** - Type patterns
11. **src/components/domains/requests/utils/requestHelpers.ts** - Utility patterns

### Project Setup & Configuration

12. **CAPABILITY_ASSESSMENT.md** - Project feasibility & timeline
13. **TEMPLATE_REORGANIZATION.md** - How template is organized
14. **CLAUDE_CLI_SETUP.md** - Speed up Claude CLI permissions
15. **FOUNDATION_COMPLETE.md** - What's already built

---

## 🔄 Session Workflow

### 1. Start Session
```
"Continue Thiam Dashboard. Read SESSION_NOTES.md.
Today: [feature name]"
```

### 2. During Session
Ask Claude to:
- Follow Request domain patterns
- Use type-safe API hooks
- Write tests
- Update documentation

### 3. End Session
```
"Update SESSION_NOTES.md with:
- What we built today
- Decisions made
- What's next for next session"
```

---

## 💡 Pro Tips

### Tip 1: Reference the Request Domain
```
"Build OfferList following the pattern in RequestList
(src/components/domains/requests/components/RequestList.tsx)"
```

### Tip 2: Update Types After API Changes
```
"The API changed. Run npm run api:update, then adjust
the affected components."
```

### Tip 3: Ask for Multiple Options
```
"Show me 2-3 approaches for [problem].
Consider: performance, maintainability, DDD principles."
```

### Tip 4: Request Step-by-Step
```
"Build [feature] step-by-step:
1. First, create the types
2. Then, create the component
3. Then, add validation
4. Finally, export from index.ts

Let's do one step at a time."
```

### Tip 5: Keep SESSION_NOTES Updated
```
"After each major task, update SESSION_NOTES.md so we
don't lose context."
```

---

## 🎯 Example Sessions

### Example 1: Build Request List Page

```
Continue Thiam Dashboard. Read SESSION_NOTES.md.

Today: Build customer request list page
Route: /customer/requests (from ROUTING_STRATEGY.md)
Domain: requests (reference implementation exists)

Steps:
1. Create app/(authenticated)/customer/requests/page.tsx
2. Use RequestList component from domain
3. Add filters, pagination
4. Test with mock data

Start with step 1.
```

### Example 2: Add New Domain (Menus)

```
Continue Thiam Dashboard. Read SESSION_NOTES.md.

Today: Set up Menu domain following Request domain pattern
Location: src/components/domains/menus/

Copy the structure from requests domain:
- types/menu.types.ts (adapt from request.types.ts)
- hooks/useMenuFilters.ts (adapt from useRequestFilters.ts)
- utils/menuHelpers.ts (adapt from requestHelpers.ts)
- validation/menuSchema.ts (adapt from requestSchema.ts)
- index.ts (public API)

Let's start with types.
```

### Example 3: Implement Authentication

```
Continue Thiam Dashboard. Read SESSION_NOTES.md.

Today: Implement authentication system
Location: src/lib/session/

Need:
1. Session management (cookies/JWT)
2. Login/logout functions
3. useSession hook
4. useAuth hook
5. Protected route component

Follow patterns from CODING_GUIDELINES.md.
Start with session management.
```

---

## 🚨 If You're Stuck

### Problem: Not sure what to build next
```
"What should I build next? Show me:
1. Most important features from SESSION_NOTES.md roadmap
2. Dependencies (what needs to exist first)
3. Effort estimate for each

Help me prioritize."
```

### Problem: Don't know the pattern
```
"How do I [task]? Show me:
1. The pattern in Request domain
2. A template from CODING_GUIDELINES.md
3. Working example from src/lib/api/examples.tsx"
```

### Problem: API changed
```
"API changed. Help me:
1. Run npm run api:update
2. Find breaking changes in types
3. Fix affected components"
```

### Problem: Lost context
```
"Remind me:
1. What's the current state? (from SESSION_NOTES.md)
2. What was I working on last session?
3. What are the next steps?"
```

---

## ✅ Before Ending Session

Always ask Claude to:

```
"Update SESSION_NOTES.md with:

1. What we built today (files created/modified)
2. Decisions made and why
3. What's next for next session
4. Any blockers or questions

Add to Session History section."
```

---

## 📊 Quick Health Check

Before starting work, verify:

```
✅ SESSION_NOTES.md is up to date
✅ API types are current (npm run api:update if needed)
✅ I know which domain/feature I'm building
✅ I've reviewed the Request domain reference
✅ I have CODING_GUIDELINES.md open
```

---

**This file makes every session productive from minute one!** ⚡️

Keep it bookmarked. It's your session starter template.
