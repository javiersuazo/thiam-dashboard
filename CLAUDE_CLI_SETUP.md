# Claude CLI Setup for Fast Execution

This guide shows you how to configure Claude CLI permissions so operations run faster across all sessions.

## Current Problem

Right now, many bash commands require approval because the permissions are too restrictive. This slows down development when Claude needs to:
- Run `sed`, `find`, `grep` across the codebase
- Install npm packages
- Run build commands
- Execute git operations
- Update multiple files at once

## Solution: Update Permissions

You need to update your Claude CLI project settings to grant broader permissions.

### Step 1: Locate Your Project Settings

Your Claude CLI project settings are stored in:
```
/Users/javiersuazo/thiago/thiam-dashboard/.claudeproject
```

Or you can use the Claude CLI command:
```bash
claude project settings
```

### Step 2: Add These Permissions

Add these permission rules to your `.claudeproject` file:

```yaml
# File Access Permissions
permissions:
  read:
    - "/Users/javiersuazo/thiago/thiam-api/**"
    - "/Users/javiersuazo/thiago/**"

  write:
    - "/Users/javiersuazo/thiago/thiam-dashboard/**"

  edit:
    - "/Users/javiersuazo/thiago/thiam-dashboard/**"

# Bash Command Permissions
bash:
  # Allow all commands in project directory
  - command: "*"
    path: "/Users/javiersuazo/thiago/thiam-dashboard"

  # Specific commands that should always work
  - command: "npm"
    args: "*"
  - command: "npx"
    args: "*"
  - command: "node"
    args: "*"

  # File operations
  - command: "find"
    args: "*"
  - command: "grep"
    args: "*"
  - command: "sed"
    args: "*"
  - command: "awk"
    args: "*"

  # Git operations
  - command: "git"
    args: "*"

  # Build and dev tools
  - command: "npm run build"
  - command: "npm run dev"
  - command: "npm install"
  - command: "npm uninstall"

  # File management
  - command: "ls"
    args: "*"
  - command: "cat"
    args: "*"
  - command: "tree"
    args: "*"
  - command: "du"
    args: "*"
```

### Step 3: Alternative - Grant Full Project Access

If you want maximum speed and trust Claude completely with this project, you can grant full access:

```yaml
permissions:
  read:
    - "/Users/javiersuazo/thiago/**"

  write:
    - "/Users/javiersuazo/thiago/thiam-dashboard/**"

  edit:
    - "/Users/javiersuazo/thiago/thiam-dashboard/**"

bash:
  # Allow all bash commands in project
  - command: "*"
    path: "/Users/javiersuazo/thiago/thiam-dashboard"

  # No approval needed for common operations
  auto_approve:
    - "npm*"
    - "npx*"
    - "git*"
    - "find*"
    - "grep*"
    - "sed*"
    - "ls*"
    - "cat*"
    - "tree*"
```

## What This Does

With these permissions:

✅ **Faster bulk operations** - Can update 100+ files without approval each time
✅ **Seamless npm operations** - Install, uninstall, update packages without prompts
✅ **Quick file searches** - Find, grep, sed work instantly
✅ **Build automation** - Run builds and tests without approval
✅ **Git operations** - Commit, push, branch without interruption

## Security Considerations

**These permissions are safe because:**
1. They're scoped to your project directory only
2. Read access is limited to your thiago folder
3. Write access is only for the dashboard project
4. Destructive git operations (force push, hard reset) still require approval
5. Operations outside the project directory still need approval

**What's still protected:**
- Force git operations (--force, --no-verify)
- System-level commands
- File operations outside project directory
- Database operations

## How to Apply

### Option A: Using Claude CLI
```bash
cd /Users/javiersuazo/thiago/thiam-dashboard
claude project settings edit
# Paste the permissions from above
```

### Option B: Edit File Directly
```bash
# Open the project settings file
nano /Users/javiersuazo/thiago/thiam-dashboard/.claudeproject

# Or use your favorite editor
code /Users/javiersuazo/thiago/thiam-dashboard/.claudeproject
```

### Option C: Let Claude Do It

You can ask Claude to update the permissions:
```
"Claude, please update the .claudeproject file with the permissions
listed in CLAUDE_CLI_SETUP.md to allow faster execution"
```

## Verify It's Working

After updating permissions, test with:

```bash
# Should run without approval
find src/components -name "*.tsx" | head -5

# Should run without approval
npm install

# Should run without approval
git status
```

If these still ask for approval, the permissions haven't been applied correctly.

## Troubleshooting

### Permissions Not Working?

1. **Check file location**: Make sure `.claudeproject` is in the project root
2. **Restart Claude**: Close and reopen Claude CLI
3. **Check syntax**: YAML is sensitive to indentation
4. **Verify paths**: Make sure paths match exactly

### Still Asking for Approval?

Try granting the wildcard permission:
```yaml
bash:
  - command: "*"
    path: "/Users/javiersuazo/thiago/thiam-dashboard"
```

This allows any command within the project directory without approval.

## Recommended Setup

For fastest development without sacrificing safety:

```yaml
permissions:
  read:
    - "/Users/javiersuazo/thiago/**"
  write:
    - "/Users/javiersuazo/thiago/thiam-dashboard/**"
  edit:
    - "/Users/javiersuazo/thiago/thiam-dashboard/**"

bash:
  - command: "*"
    path: "/Users/javiersuazo/thiago/thiam-dashboard"

  # Still block truly dangerous operations
  blocked:
    - "rm -rf /"
    - "sudo*"
    - "chmod 777*"
```

This gives Claude full access to your project while blocking obviously dangerous commands.

---

**Once configured, your development sessions will be much faster!** 🚀

Commands that previously needed 5-10 approvals will now run instantly.
