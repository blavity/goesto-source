import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-pool-workers'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

interface HandledValidationError {
  statusCode: 400
  statusMessage: 'Validation Error'
  data: {
    issues: unknown[]
    name: 'ZodError'
    stack: string
  }
}

function isHandledValidationError(error: unknown): error is HandledValidationError {
  if (typeof error !== 'object' || error === null
    || !('statusCode' in error) || error.statusCode !== 400
    || !('statusMessage' in error) || error.statusMessage !== 'Validation Error'
    || !('data' in error) || typeof error.data !== 'object' || error.data === null) {
    return false
  }

  const { data } = error
  return 'issues' in data && Array.isArray(data.issues)
    && 'name' in data && data.name === 'ZodError'
    && 'stack' in data && typeof data.stack === 'string'
    && data.stack.includes('validateData')
}

export default defineConfig(async ({ mode }) => ({
  plugins: [
    cloudflareTest({
      wrangler: {
        configPath: './wrangler.jsonc',
      },
      miniflare: {
        cf: true,
        bindings: {
          TEST_MIGRATIONS: await readD1Migrations('./drizzle'),
        },
      },
    }),
  ],
  test: {
    env: loadEnv(mode, process.cwd(), ''),
    projects: [
      {
        // Server/API tests. Run in the Workers runtime against the real
        // wrangler.jsonc bindings — this is what makes D1/KV assertions real.
        extends: true,
        test: {
          name: 'workers',
          include: ['tests/**/*.spec.ts'],
          exclude: ['tests/unit/**'],
          isolate: false,
          maxWorkers: 1,
          setupFiles: ['./tests/setup.ts'],
          testTimeout: 10_000,
          // Vitest 4 requires a distinct sequence.groupOrder whenever
          // projects differ on maxWorkers; otherwise it throws before any
          // test runs.
          sequence: { groupOrder: 0 },
        },
      },
      {
        // Composable/store tests. These import from app/, which imports `vue` —
        // a package the Workers runtime cannot resolve, so they never executed
        // at all. Plain Node instead.
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.spec.ts'],
          environment: 'node',
          testTimeout: 10_000,
          sequence: { groupOrder: 1 },
        },
      },
    ],
    onUnhandledError(error) {
      return !isHandledValidationError(error)
    },
  },
}))
