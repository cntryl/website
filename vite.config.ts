import { askr } from '@askrjs/vite';
import type { PluginOption, UserConfig } from 'vite-plus';

function askrPlugin(): PluginOption {
  return askr() as unknown as PluginOption;
}

export default function config(): UserConfig {
  return {
    plugins: [askrPlugin()],
    lint: {
      ignorePatterns: ['.askr/**', 'dist/**', 'node_modules/**'],
    },
    fmt: {
      semi: true,
      singleQuote: true,
      trailingComma: 'es5',
      printWidth: 80,
      tabWidth: 2,
    },
    build: {
      outDir: '.askr/client',
      emptyOutDir: true,
      sourcemap: true,
    },
    server: {
      watch: {
        // Running a production build (dist/, .askr/) alongside `vp dev` would
        // otherwise make the dev server treat generated output as source
        // changes and force-reload every connected tab mid-session.
        ignored: ['**/dist/**', '**/.askr/**'],
      },
    },
  };
}
