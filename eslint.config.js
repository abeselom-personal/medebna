import pluginImport from 'eslint-plugin-import'
import pluginUnicorn from 'eslint-plugin-unicorn'

export default [
    {
        files: ['**/*.js'],
        plugins: {
            import: pluginImport,
            unicorn: pluginUnicorn,
        },
        rules: {
            'import/extensions': ['error', 'always', { js: 'always' }],
            'unicorn/import-style': [
                'error',
                {
                    styles: {
                        js: {
                            named: true,
                            default: true,
                            namespace: true,
                        },
                    },
                },
            ],
        },
        settings: {
            'import/resolver': {
                node: {
                    extensions: ['.js'],
                },
            },
        },
    },
]
