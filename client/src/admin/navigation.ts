import type { IconName } from '../components/icons'

export type AdminTabKey =
  | 'overview'
  | 'hero'
  | 'about'
  | 'stats'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'contact'
  | 'assistant'
  | 'guide'
  | 'account'

export type AssistantTabKey = 'resume' | 'palette' | 'chat'

type NavItem<K extends string> = {
  key: K
  label: string
  icon: IconName
}

export const ADMIN_NAV_GROUPS: {
  key: string
  label: string
  items: NavItem<AdminTabKey>[]
}[] = [
  {
    key: 'site',
    label: '站点',
    items: [{ key: 'overview', label: '全局设置', icon: 'settings' }],
  },
  {
    key: 'content',
    label: '内容管理',
    items: [
      { key: 'hero', label: '首屏 Hero', icon: 'sparkles' },
      { key: 'about', label: '关于我', icon: 'user' },
      { key: 'stats', label: '数据统计', icon: 'star' },
      { key: 'experience', label: '工作经历', icon: 'briefcase' },
      { key: 'education', label: '教育背景', icon: 'graduation' },
      { key: 'skills', label: '技能栈', icon: 'grid' },
      { key: 'projects', label: '项目展示', icon: 'link' },
      { key: 'contact', label: '联系与社交', icon: 'mail' },
    ],
  },
  {
    key: 'tools',
    label: '工具与支持',
    items: [
      { key: 'assistant', label: '智能助手', icon: 'sparkles' },
      { key: 'guide', label: '使用指南', icon: 'settings' },
      { key: 'account', label: '账号与数据', icon: 'key' },
    ],
  },
]

export const ADMIN_TABS = ADMIN_NAV_GROUPS.flatMap((group) => group.items)

export const ASSISTANT_SUB_TABS: NavItem<AssistantTabKey>[] = [
  { key: 'resume', label: '简历导入', icon: 'upload' },
  { key: 'palette', label: '配色助手', icon: 'sparkles' },
  { key: 'chat', label: 'AI 问答', icon: 'send' },
]
