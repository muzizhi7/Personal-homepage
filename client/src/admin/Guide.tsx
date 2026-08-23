import { Icon } from '../components/icons'
import type { IconName } from '../components/icons'
import { SectionCard } from './fields'

const GUIDE_SECTIONS: {
  icon: IconName
  title: string
  desc: string
  tips: string[]
}[] = [
  {
    icon: 'settings',
    title: '全局设置',
    desc: '决定整站气质：标题（浏览器标签 / 分享卡片）、SEO 描述与关键词、明暗模式、主色辅色、圆角、字号、版块顺序与开关、页脚版权。',
    tips: [
      '主色用于按钮 / 链接 / 高亮，辅色用于渐变与背景点缀。两个颜色选「同色系」或「经典互补」最稳，不确定就交给配色助手。',
      '版块顺序可上下拖动，开关控制是否显示；只保留最想展示的版块，页面更聚焦。',
      '页脚 {year} 会自动替换成当前年份。',
    ],
  },
  {
    icon: 'sparkles',
    title: '首屏 Hero',
    desc: '访客的第一印象，决定 3 秒内是否继续往下看。包含徽章、姓名、一句话大标题、副标题、头像、滚动标签和两个行动按钮。',
    tips: [
      '大标题写「定位」而不是自我介绍，例如“用智能体重构产品体验”；副标题再展开 2-3 句。',
      'badges 放 4-8 个核心标签，别人 5 秒内能记住你的关键词。',
      '头像建议 1:1 正方形，自动居中裁剪。',
    ],
  },
  {
    icon: 'user',
    title: '关于我',
    desc: '让访客信任你。2-4 段介绍 + 4-6 个高亮要点，可配一张生活/工作照。',
    tips: [
      '每段讲一个主题：我是谁 → 我擅长什么 → 我在做什么 / 取得什么成绩。',
      '高亮要点用短句，方便快速扫读。',
    ],
  },
  {
    icon: 'star',
    title: '数据统计',
    desc: '数字最有说服力。年限、项目数、用户量、播放量、开源贡献等做成滚动数字卡片。',
    tips: ['value 用简洁格式，如 5+、30万+、1.2k。', '选 3-6 个真实且有亮点的数字，别堆砌。'],
  },
  {
    icon: 'briefcase',
    title: '工作经历',
    desc: '时间线展示职业履历。公司、职位、时间、地点、描述、标签、公司链接。',
    tips: [
      '按时间倒序排列（最近的在前）。',
      '描述写「做了什么 + 结果/量化」，2-3 句即可。',
      'tags 填技术栈或业务关键词，如 React / 团队管理。',
    ],
  },
  {
    icon: 'graduation',
    title: '教育背景',
    desc: '学校、学位、时间段，可在描述里补充研究方向与荣誉。',
    tips: ['刚毕业可以写详细些；工作多年后简写即可。'],
  },
  {
    icon: 'grid',
    title: '技能栈',
    desc: '按领域分组 + 熟练度进度条，直观呈现能力地图。',
    tips: [
      '分 3-6 组（如前端 / 后端 / 工程化），每组 3-8 项。',
      'level 是 0-100 的熟练度，别全部 95+，有梯度才可信。',
    ],
  },
  {
    icon: 'link',
    title: '项目展示',
    desc: '最有说服力的作品集。名称、描述、标签、封面、Demo / GitHub 链接；勾选 featured 会放大展示。',
    tips: [
      '挑 2-6 个最有代表性的项目，质量 > 数量。',
      '描述讲「解决什么问题 + 你的贡献 + 结果」。',
      '有线上 Demo 一定放链接，比任何文字都有说服力。',
    ],
  },
  {
    icon: 'mail',
    title: '联系与社交',
    desc: '让想找你的人找得到你：邮箱、电话、位置、行动按钮与社交链接（GitHub / X / B站 / 小红书 / LinkedIn…）。',
    tips: [
      '社交平台名可自由填写，图标会自动匹配；不认识的平台显示地球图标。',
      '公开展示前请确认隐私：电话可只留邮箱。',
    ],
  },
  {
    icon: 'key',
    title: '账号与数据',
    desc: '修改后台密码、导出/导入 JSON 配置备份、一键恢复示例内容。',
    tips: [
      '首次登录后请立即修改默认密码。',
      '数据都在服务器的 data/site.json，备份整个 data/ 目录即可迁移。',
      '忘记密码：删除 data/auth.json 并重启服务，会生成新密码。',
    ],
  },
]

const FAQS: { q: string; a: string }[] = [
  {
    q: '如何让站点中英双语都好看？',
    a: '每个输入框都分「中文 / EN」两栏。EN 栏可以留空——显示时会自动回退到中文。翻译拿不准可以问「AI 问答」。',
  },
  {
    q: '我的模型 API Key 安全吗？',
    a: '密钥只保存在你自己服务器的 data/assistant.json 里，前端永远读不到完整 Key，也不会发给任何第三方。自托管等于自己保管。',
  },
  {
    q: '简历解析会不会把内容传出去？',
    a: '文件在你自己服务器上解析，请求发送给你配置的模型服务商（如 OpenAI / DeepSeek）。介意的话不要用第三方模型，或用本地 Ollama。',
  },
  {
    q: '如何部署到公网？',
    a: 'npm run build && npm start 后访问 8787 端口；服务器上用 nohup / pm2 守护，再用 nginx 反代 80 端口即可。详见项目 README。',
  },
  {
    q: '改坏了怎么恢复？',
    a: '「账号与数据 → 导出配置」养成备份习惯；或用「恢复示例内容」一键回到初始状态。',
  },
  {
    q: 'AI 配色和简历解析都需要模型吗？',
    a: 'AI 生成与简历解析需要模型；「精选配色预设」和「使用指南」不需要，开箱即用。',
  },
]

const STEPS: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: 'key',
    title: '配置模型',
    desc: '在智能助手中填写你自己的 API（Base URL + Key + 模型名），测试连接通过即可。',
  },
  {
    icon: 'upload',
    title: '一键导入简历',
    desc: '前往「智能助手 → 简历导入」，上传或粘贴简历 → 解析 → 预览 → 应用，所有版块自动填好。',
  },
  {
    icon: 'sparkles',
    title: '配色与微调',
    desc: '前往「智能助手 → 配色助手」挑一套高级配色；再到各版块微调文案、上传头像。',
  },
  {
    icon: 'eye',
    title: '保存并预览',
    desc: '右上角「保存」→「预览」实时查看；满意后部署上线分享给世界。',
  },
]

export default function Guide() {
  return (
    <div className="space-y-5">
      <SectionCard title="四步上手" desc="从零到上线，大约 10 分钟">
        <div className="grid gap-3 sm:grid-cols-2">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="flex items-start gap-3 rounded-2xl border border-line bg-surface-soft/50 p-4"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
              >
                <Icon name={step.icon} size={16} />
              </span>
              <div>
                <p className="text-[13.5px] font-bold text-ink">
                  {index + 1}. {step.title}
                </p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="各版块配置说明" desc="每个版块填什么、怎么填、避坑技巧">
        <div className="space-y-2">
          {GUIDE_SECTIONS.map((section) => (
            <details
              key={section.title}
              className="group rounded-2xl border border-line bg-surface-soft/40 transition-colors open:border-accent/40"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5">
                <Icon name={section.icon} size={16} className="shrink-0 text-accent" />
                <span className="flex-1 text-[13.5px] font-bold text-ink">{section.title}</span>
                <span className="text-[11px] text-faint transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="space-y-2 px-4 pb-4 pl-[3.25rem]">
                <p className="text-[12.5px] leading-relaxed text-muted">{section.desc}</p>
                <ul className="space-y-1.5">
                  {section.tips.map((tip) => (
                    <li key={tip} className="flex gap-2 text-[12px] leading-relaxed text-faint">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="常见问题 FAQ" desc="部署、备份、双语、安全">
        <div className="space-y-2">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border border-line bg-surface-soft/40 transition-colors open:border-accent/40"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5">
                <span className="flex-1 text-[13.5px] font-semibold text-ink">{faq.q}</span>
                <span className="text-[11px] text-faint transition-transform group-open:rotate-180">▼</span>
              </summary>
              <p className="px-4 pb-4 pl-7 text-[12.5px] leading-relaxed text-muted">{faq.a}</p>
            </details>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
