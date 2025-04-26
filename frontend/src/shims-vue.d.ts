declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@fortawesome/*' {
  import { DefineComponent } from 'vue'
  export const FontAwesomeIcon: DefineComponent<{
    icon: any
    size?: string
    fixedWidth?: boolean
    border?: boolean
    inverse?: boolean
    flip?: 'horizontal' | 'vertical' | 'both'
    spin?: boolean
    pulse?: boolean
    pull?: 'left' | 'right'
    rotation?: 90 | 180 | 270
    transform?: string | object
    mask?: object
  }>
}
