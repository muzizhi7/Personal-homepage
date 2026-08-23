// 默认示例内容(双语)。首次启动时自动写入 data/site.json。
// 所有内容都可以在后台管理界面中修改。
export function seed() {
  return {
    version: 1,
    meta: {
      title: { zh: '李远 · 全栈工程师', en: 'Leo Li · Full-stack Engineer' },
      description: {
        zh: '用代码构建优雅、流畅、有温度的产品体验。',
        en: 'Crafting elegant, fluid and human product experiences with code.',
      },
      keywords: 'fullstack, react, node, typescript, design, portfolio',
      favicon: '',
      defaultLang: 'zh',
    },
    theme: {
      mode: 'dark', // auto | light | dark
      accent: '#0a84ff',
      accent2: '#bf5af2',
      radius: 24,
      fontScale: 1,
      showGrain: true,
      showAurora: true,
    },
    layout: {
      sections: ['hero', 'about', 'stats', 'experience', 'education', 'skills', 'projects', 'contact'],
    },
    hero: {
      enabled: true,
      badge: { zh: '欢迎来到我的主页 👋', en: 'Welcome to my homepage 👋' },
      name: { zh: '李远', en: 'Leo Li' },
      headline: {
        zh: '用代码构建优雅的产品体验',
        en: 'Crafting elegant product experiences with code',
      },
      subheadline: {
        zh: '全栈工程师 · 设计爱好者 · 开源贡献者。我热衷于把复杂的问题，做成简单而美好的东西。',
        en: 'Full-stack engineer, design enthusiast and open-source contributor. I love turning complex problems into something simple and beautiful.',
      },
      avatar: '',
      badges: [
        { zh: '全栈开发', en: 'Full-stack' },
        { zh: 'UI / UX', en: 'UI / UX' },
        { zh: 'TypeScript', en: 'TypeScript' },
        { zh: 'React', en: 'React' },
        { zh: 'Node.js', en: 'Node.js' },
        { zh: '开源爱好者', en: 'Open Source' },
      ],
      ctaPrimary: { label: { zh: '查看我的项目', en: 'View my work' }, href: '#projects' },
      ctaSecondary: { label: { zh: '联系我', en: 'Contact me' }, href: '#contact' },
    },
    about: {
      enabled: true,
      title: { zh: '关于我', en: 'About Me' },
      paragraphs: [
        {
          zh: '你好，我是李远。一名拥有 5 年经验的全栈工程师，目前专注于打造高性能、高体验的 Web 产品。我相信好的技术最终要服务于人——清晰、可靠、愉悦。',
          en: "Hi, I'm Leo. A full-stack engineer with 5 years of experience, focused on building high-performance, delightful web products. I believe great technology ultimately serves people — clear, reliable and joyful.",
        },
        {
          zh: '工作之余，我喜欢折腾开源项目、研究交互设计，也热爱摄影与咖啡。这个主页的每一个像素都由我自己掌控，包括你正在使用的这套配置系统。',
          en: 'Outside work, I enjoy tinkering with open-source projects, studying interaction design, and I love photography and coffee. Every pixel of this page is under my control — including the config system you are using right now.',
        },
      ],
      highlights: [
        { zh: '全栈开发能力', en: 'Full-stack development' },
        { zh: '产品思维与设计感', en: 'Product thinking & design' },
        { zh: '追求极致的细节', en: 'Obsessed with details' },
        { zh: '持续学习与分享', en: 'Always learning & sharing' },
      ],
      avatar: '',
    },
    stats: {
      enabled: true,
      title: { zh: '一些数字', en: 'By the numbers' },
      items: [
        { value: '5+', label: { zh: '年开发经验', en: 'Years of experience' } },
        { value: '30+', label: { zh: '完成的项目', en: 'Projects shipped' } },
        { value: '1.2k', label: { zh: 'GitHub Stars', en: 'GitHub stars' } },
        { value: '12', label: { zh: '开源贡献', en: 'Open-source contributions' } },
      ],
    },
    experience: {
      enabled: true,
      title: { zh: '工作经历', en: 'Experience' },
      items: [
        {
          company: { zh: '某科技公司', en: 'TechNova Inc.' },
          role: { zh: '高级全栈工程师', en: 'Senior Full-stack Engineer' },
          period: { zh: '2022 — 至今', en: '2022 — Present' },
          location: { zh: '上海', en: 'Shanghai' },
          description: {
            zh: '负责核心产品的前后端架构设计与开发，主导了微前端改造与性能优化，将首屏加载时间缩短 60%；带领 3 人小团队交付多个高并发业务模块。',
            en: 'Owned frontend & backend architecture for the core product. Led a micro-frontend migration and performance overhaul that cut first paint by 60%; led a 3-person team shipping several high-concurrency modules.',
          },
          tags: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
          logo: '',
          url: '',
        },
        {
          company: { zh: '某互联网公司', en: 'ByteCraft Studio' },
          role: { zh: '前端工程师', en: 'Frontend Engineer' },
          period: { zh: '2019 — 2022', en: '2019 — 2022' },
          location: { zh: '杭州', en: 'Hangzhou' },
          description: {
            zh: '从 0 到 1 搭建公司设计系统与组件库，统一了 6 条产品线的视觉与交互规范；负责多个面向 C 端用户的营销活动页面，峰值日活超百万。',
            en: 'Built the company design system and component library from scratch, unifying visual & interaction specs across 6 product lines; shipped consumer marketing pages reaching 1M+ DAU at peak.',
          },
          tags: ['Vue', 'TypeScript', 'Design System', 'Vite'],
          logo: '',
          url: '',
        },
      ],
    },
    education: {
      enabled: true,
      title: { zh: '教育背景', en: 'Education' },
      items: [
        {
          school: { zh: '某大学', en: 'Some University' },
          degree: { zh: '硕士 · 计算机科学与技术', en: 'M.S. in Computer Science' },
          period: { zh: '2016 — 2019', en: '2016 — 2019' },
          description: {
            zh: '研究方向：分布式系统与 Web 性能优化。',
            en: 'Research focus: distributed systems and web performance.',
          },
        },
        {
          school: { zh: '某理工大学', en: 'Another Tech University' },
          degree: { zh: '学士 · 软件工程', en: 'B.S. in Software Engineering' },
          period: { zh: '2012 — 2016', en: '2012 — 2016' },
          description: { zh: '', en: '' },
        },
      ],
    },
    skills: {
      enabled: true,
      title: { zh: '技能栈', en: 'Skills' },
      groups: [
        {
          name: { zh: '前端', en: 'Frontend' },
          items: [
            { name: 'React', level: 92 },
            { name: 'TypeScript', level: 90 },
            { name: 'Tailwind CSS', level: 88 },
            { name: 'Next.js', level: 85 },
          ],
        },
        {
          name: { zh: '后端', en: 'Backend' },
          items: [
            { name: 'Node.js', level: 88 },
            { name: 'PostgreSQL', level: 82 },
            { name: 'Redis', level: 75 },
            { name: 'Go', level: 68 },
          ],
        },
        {
          name: { zh: '工程与工具', en: 'Engineering' },
          items: [
            { name: 'Git', level: 90 },
            { name: 'Docker', level: 78 },
            { name: 'CI/CD', level: 80 },
            { name: 'Figma', level: 70 },
          ],
        },
      ],
    },
    projects: {
      enabled: true,
      title: { zh: '精选项目', en: 'Featured Projects' },
      items: [
        {
          name: { zh: 'Aurora UI 组件库', en: 'Aurora UI Kit' },
          description: {
            zh: '一套基于 React + TypeScript 的现代组件库，内置暗色模式、动画与无障碍支持，被 40+ 项目使用。',
            en: 'A modern React + TypeScript component library with built-in dark mode, animations and a11y. Used by 40+ projects.',
          },
          tags: ['React', 'TypeScript', 'Design System'],
          image: '',
          links: { demo: '', github: 'https://github.com/' },
          featured: true,
        },
        {
          name: { zh: 'Flowboard 看板工具', en: 'Flowboard' },
          description: {
            zh: '轻量级的团队任务看板，支持实时协作与键盘流操作，让每天的工作流像流水一样顺畅。',
            en: 'A lightweight team kanban with real-time collaboration and keyboard-first flows — keeping your daily workflow as smooth as water.',
          },
          tags: ['Node.js', 'WebSocket', 'Vue'],
          image: '',
          links: { demo: '', github: 'https://github.com/' },
          featured: false,
        },
        {
          name: { zh: 'SnapShot 截图美化', en: 'SnapShot' },
          description: {
            zh: '把普通截图变成精美的分享卡片，自动识别主题色与阴影，一键导出。',
            en: 'Turn plain screenshots into beautiful share cards — auto theme color, shadows, one-click export.',
          },
          tags: ['Canvas', 'WebAssembly'],
          image: '',
          links: { demo: '', github: 'https://github.com/' },
          featured: false,
        },
        {
          name: { zh: 'Pulse 个人数据面板', en: 'Pulse Dashboard' },
          description: {
            zh: '聚合跑步、阅读、GitHub 贡献等个人数据的可视化面板，用图表讲述你的生活节奏。',
            en: 'A personal analytics dashboard aggregating running, reading and GitHub activity — telling the rhythm of your life with charts.',
          },
          tags: ['Data Viz', 'React', 'APIs'],
          image: '',
          links: { demo: '', github: 'https://github.com/' },
          featured: false,
        },
      ],
    },
    contact: {
      enabled: true,
      title: { zh: '保持联系', en: "Let's Connect" },
      subtitle: {
        zh: '无论是合作机会、技术交流，还是只是想打个招呼，我的收件箱永远为你敞开。',
        en: 'Whether it’s a collaboration, a technical chat, or just saying hi — my inbox is always open.',
      },
      email: 'hello@example.com',
      phone: '',
      location: { zh: '中国 · 上海', en: 'Shanghai, China' },
      cta: { label: { zh: '发邮件给我', en: 'Email me' }, href: 'mailto:hello@example.com' },
      socials: [
        { platform: 'github', url: 'https://github.com/', label: { zh: 'GitHub', en: 'GitHub' } },
        { platform: 'x', url: 'https://x.com/', label: { zh: 'X / Twitter', en: 'X / Twitter' } },
        { platform: 'bilibili', url: 'https://space.bilibili.com/', label: { zh: 'Bilibili', en: 'Bilibili' } },
        { platform: 'mail', url: 'mailto:hello@example.com', label: { zh: '邮箱', en: 'Email' } },
        { platform: 'weibo', url: '', label: { zh: '微博', en: 'Weibo' } },
      ],
    },
    footer: {
      text: { zh: '© {year} 李远 · 用心构建每一个像素', en: '© {year} Leo Li · Crafted pixel by pixel' },
      showSocials: true,
    },
  }
}
