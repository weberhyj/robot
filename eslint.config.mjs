import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  formatters: true,
  ignores: [
    'src-tauri/target',
    'src-tauri/gen',
  ],
})
