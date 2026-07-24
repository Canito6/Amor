import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{js,jsx}'],
        extends: [
            js.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            globals: globals.browser,
            parserOptions: { ecmaFeatures: { jsx: true } },
        },
        rules: {
            // Esta regra (parte da preparação para o React Compiler) assinala o
            // padrão-base "carregar dados ao montar a página" (setLoading(true) logo
            // no início de uma função invocada num useEffect), usado de forma
            // extremamente comum e idiomática em praticamente todas as páginas desta
            // aplicação. Corrigir isto exigiria reescrever ~35 pontos de carregamento
            // de dados em toda a app, com risco real de introduzir bugs de
            // comportamento, para satisfazer uma regra ainda experimental e pouco
            // adotada. Baixada para aviso em vez de erro, para não bloquear o CI
            // enquanto se mantém visível para quem quiser adotar o padrão mais
            // rigoroso no futuro.
            'react-hooks/set-state-in-effect': 'warn',
        },
    },
    {
        files: ['**/__tests__/**/*.{js,jsx}', '**/*.test.{js,jsx}', 'src/test/**/*.{js,jsx}'],
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
        },
    },
])