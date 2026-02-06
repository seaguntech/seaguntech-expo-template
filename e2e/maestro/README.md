# Maestro E2E Testing Configuration for Seaguntech Expo Template

## Installation

### macOS

```bash
brew tap mobile-dev-inc/tap
brew install maestro
```

### Linux

```bash
curl -fsSL "https://get.maestro.mobile.dev" | bash
```

### Windows (via PowerShell)

```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-Expression (Invoke-WebRequest -Uri "https://get.maestro.mobile.dev" -UseBasicParsing).Content
```

## Setup

1. Start your Metro bundler:

```bash
pnpm start
```

2. Build and install the app on your device/simulator:

```bash
# iOS
pnpm ios

# Android
pnpm android
```

3. Run E2E tests:

```bash
# Run all tests
maestro test e2e/maestro/flows

# Run specific test
maestro test e2e/maestro/flows/auth/login.yaml

# Run with debug output
maestro test e2e/maestro/flows --debug

# Run test suite
maestro test e2e/maestro/config/test-suites.yaml --suite smoke
```

## Available Test Flows

### Authentication (`auth/`)

- `login.yaml` - Test login flow with valid credentials
- `signup.yaml` - Test user registration flow
- `callback-set-password.yaml` - Test recovery callback deep link routes to set password screen
- `callback-verify-link-set-password.yaml` - Test Supabase `/auth/v1/verify` deep link routes to set password screen

### Core Features (`features/`)

- `tasks.yaml` - Test CRUD operations on tasks

### Navigation (`navigation/`)

- `tab-navigation.yaml` - Test tab switching between Home, Tasks, AI, Premium, Profile

### Onboarding (`onboarding/`)

- `complete-onboarding.yaml` - Reusable subflow for completing onboarding

## Test Suites

| Suite        | Description                          |
| ------------ | ------------------------------------ |
| `smoke`      | Quick validation of critical paths   |
| `auth`       | Authentication flows (login, signup) |
| `features`   | Feature-specific tests (tasks, etc.) |
| `regression` | Full regression suite                |
| `ci`         | Optimized for CI/CD pipelines        |

## testID Convention

All interactive components use testID attributes following this naming convention:

```
{feature}-{component}-{element}
```

### Auth Components

- `auth-email-input` - Email input field
- `auth-password-input` - Password input field
- `auth-confirmpassword-input` - Confirm password field
- `auth-newpassword-input` - New password field in reset flow
- `auth-reset-confirmpassword-input` - Confirm new password field in reset flow
- `auth-displayname-input` - Display name field
- `auth-signin-button` - Sign in button
- `auth-signup-button` - Sign up button
- `auth-updatepassword-button` - Update password button
- `auth-google-button` - Google OAuth button
- `auth-apple-button` - Apple OAuth button

### Task Components

- `task-title-input` - Task title input
- `task-description-input` - Task description input
- `task-priority-{low|medium|high|urgent}` - Priority buttons
- `task-tag-input` - Tag input field
- `task-addtag-button` - Add tag button
- `task-create-button` - Create task button
- `task-cancel-button` - Cancel button

### Navigation

- `tab-home` - Home tab
- `tab-tasks` - Tasks tab
- `tab-ai` - AI tab
- `tab-premium` - Premium tab
- `tab-profile` - Profile tab

### Screens

- `home-screen` - Home screen container
- `tasks-screen` - Tasks screen container
- `ai-screen` - AI screen container
- `premium-screen` - Premium screen container
- `profile-screen` - Profile screen container

## Environment Variables

Test credentials are passed via environment variables for security. **Never commit real credentials.**

### Setup

1. Copy the example file:

```bash
cp e2e/maestro/.env.e2e.example e2e/maestro/.env.e2e
```

2. Edit `.env.e2e` with your test credentials:

```bash
TEST_EMAIL=your-test-email@example.com
TEST_PASSWORD=your-test-password
```

### Running Tests with Credentials

**Option 1: Using -e flag (recommended)**

```bash
maestro test -e TEST_EMAIL=your@email.com -e TEST_PASSWORD=yourpass e2e/maestro/flows/auth/login.yaml
```

**Option 2: Export environment variables**

```bash
export TEST_EMAIL=your@email.com
export TEST_PASSWORD=yourpass
maestro test e2e/maestro/flows/auth/login.yaml
```

**Option 3: Source from .env file**

```bash
source e2e/maestro/.env.e2e
maestro test e2e/maestro/flows/auth/login.yaml
```

### Required Variables

| Variable        | Description                      | Used In       |
| --------------- | -------------------------------- | ------------- |
| `TEST_EMAIL`    | Valid test account email         | `login.yaml`  |
| `TEST_PASSWORD` | Test account password            | `login.yaml`  |
| `RANDOM_SUFFIX` | Auto-generated for unique emails | `signup.yaml` |

## CI/CD Integration

Tests run automatically on:

- Pull requests to `main` or `develop` branches (paths: `src/**`, `app/**`, `e2e/**`)
- Manual workflow dispatch with suite/platform selection

See `.eas/workflows/e2e-tests.yml` for the full CI configuration.

## Maestro MCP Integration (Claude Code)

Maestro MCP enables Claude Code to interact with Maestro for AI-assisted test generation and debugging.

### Installation

Maestro MCP is pre-installed with the Maestro CLI. Run it using:

```bash
maestro mcp
```

### Configuration for Claude Code

Add to your Claude Code settings:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "maestro": {
      "command": "maestro",
      "args": ["mcp"]
    }
  }
}
```

After adding this configuration, restart Claude Desktop.

**Note:** If the `maestro` command isn't in your system PATH, replace `"maestro"` with the full path to your Maestro CLI executable (e.g., `$HOME/.maestro/bin/maestro`).

### What MCP Enables

- Universal connectivity between Claude and Maestro
- AI-assisted test flow generation
- Interactive debugging of UI tests
- Automatic testID suggestions

## Best Practices

1. **Use testID selectors** instead of text-based selectors for reliability
2. **Add wait strategies** (`extendedWaitUntil`) for network operations and animations
3. **Keep flows focused** - one flow per user journey
4. **Use subflows** for reusable steps (e.g., login, onboarding)
5. **Tag tests appropriately** for selective test runs
6. **Idempotent Tests**: Each test should be able to run independently
7. **Cleanup**: Tests should clean up after themselves when possible

## Troubleshooting

### App not found

Make sure the app is installed and running on the device/simulator before running tests.

### Tests failing due to timing

Increase the timeout in your flow files or use `extendedWaitUntil` with appropriate timeout values.

### Element not found

- Verify testID is correctly set in the component
- Check if element is visible (not scrolled out of view)
- Use `maestro studio` to inspect the UI hierarchy

### Flaky tests

- Add `extendedWaitUntil` before assertions
- Use retry configuration in `config.yaml`
- Consider using `waitForAnimationToEnd` after navigation

## Resources

- [Maestro Documentation](https://maestro.mobile.dev/)
- [Maestro MCP Guide](https://docs.maestro.dev/getting-started/maestro-mcp)
- [Maestro CLI Reference](https://maestro.mobile.dev/cli)
- [Best Practices](https://maestro.mobile.dev/advanced/best-practices)
