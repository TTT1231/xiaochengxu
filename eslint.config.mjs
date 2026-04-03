import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import vuePlugin from 'eslint-plugin-vue';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import * as vueParser from 'vue-eslint-parser';

export default [
   // JS/TS 文件配置
   {
      files: ['**/*.{js,ts,mjs}'],
      ignores: ['eslint.config.mjs'], // 排除配置文件
      languageOptions: {
         parser: tsParser,
         parserOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            project: './tsconfig.eslint.json',
            tsconfigRootDir: import.meta.dirname,
         },
      },
      plugins: {
         '@typescript-eslint': tsPlugin,
         prettier: prettierPlugin,
      },
      rules: {
         // 基础规则（自定义规则）
         semi: ['error', 'always'],
         quotes: ['error', 'single'],
         'comma-dangle': ['error', 'always-multiline'],
         'no-console': 'off',

         // TypeScript 规则
         '@typescript-eslint/no-unused-vars': [
            'warn',
            { argsIgnorePattern: '^_' },
         ],
         '@typescript-eslint/no-explicit-any': 'warn',

         // Import/Export 类型规则
         '@typescript-eslint/consistent-type-imports': [
            'error',
            {
               prefer: 'type-imports',
               disallowTypeAnnotations: false,
            },
         ],
         '@typescript-eslint/consistent-type-exports': [
            'error',
            {
               fixMixedExportsWithInlineTypeSpecifier: true,
            },
         ],

         // Prettier 集成
         'prettier/prettier': 'error',
      },
   },

   // Vue 文件配置
   {
      files: ['**/*.vue'],
      languageOptions: {
         parser: vueParser,
         parserOptions: {
            parser: tsParser,
            ecmaVersion: 'latest',
            sourceType: 'module',
         },
      },
      plugins: {
         vue: vuePlugin,
         prettier: prettierPlugin,
      },
      rules: {
         // Vue 3 推荐规则
         'vue/multi-word-component-names': 'off',
         'vue/no-v-html': 'warn',
         'vue/require-default-prop': 'off',
         'vue/require-explicit-emits': 'warn',

         // Prettier 集成
         'prettier/prettier': 'error',
      },
   },

   prettierConfig, // 禁用与 Prettier 冲突的规则，必须放在最后
   {
      ignores: ['node_modules/**', 'dist/**', 'esbuild.config.mjs', 'scripts/dev.mjs', 'scripts/inject-env.mjs'],
   },
];
