import antfu from '@antfu/eslint-config'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(antfu(
  {
    formatters: true,
    pnpm: false,
    ignores: [
      'app/components/ui/**',
      'app/data/**',
      'public/*.json',
      // Internal governance and planning docs. Not source, and excluded from the
      // public AGPL source mirror. Their fenced code samples are illustrative
      // rather than executable, so linting them as code produces only noise.
      '.internal/**',
      // drizzle-kit writes these byte-for-byte and without a trailing newline.
      // Formatting them only makes `db:generate` revert the fix, so the repo
      // oscillates between lint-clean and lint-red on every migration. Same
      // reasoning as app/components/ui/**: generated, not authored.
      'drizzle/meta/**',
    ],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-console': 'off',
      'node/prefer-global/process': 'off',
      'vue/no-v-html': 'off',
    },
  },
  {
    plugins: {
      'better-tailwindcss': eslintPluginBetterTailwindcss,
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: './app/assets/css/tailwind.css',
      },
    },
    rules: {
      ...eslintPluginBetterTailwindcss.configs['recommended-warn'].rules,
    },
  },
))
