import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          root: './unit_tests',
          environment: 'unit',
          setupFiles: ['./setup.unit.ts'],
        },
      },
    ],
  },
})