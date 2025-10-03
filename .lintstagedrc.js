module.exports = {
  '*.{ts,tsx}': [
    'eslint --fix',
    'secretlint'
  ],
  '*.{json,md}': [
    'secretlint'
  ]
}
