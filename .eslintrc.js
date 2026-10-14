module.exports = {
  // 原生工程（含 Gradle 生成的报告）不属于 JS 代码
  ignorePatterns: ['native/'],
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/prop-types': 'off',
    'react-hooks/exhaustive-deps': 'warn',
  },
  overrides: [
    {
      // 命令行脚本需要输出到终端
      files: ['scripts/**/*'],
      rules: { 'no-console': 'off' },
    },
  ],
};
