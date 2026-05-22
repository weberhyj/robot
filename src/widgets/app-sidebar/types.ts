import type { Component } from 'vue'

export interface NavItem {
  path: string
  title: string
  icon: Component
  order: number
}
