declare interface Window {
  // extend the window
}

// with unplugin-vue-markdown, markdown files can be treated as Vue components

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}
