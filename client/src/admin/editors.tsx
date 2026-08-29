import type { SiteData } from '../lib/types'
import {
  ColorInput,
  Field,
  ImagePicker,
  LangInput,
  ListEditor,
  ResumePicker,
  SectionCard,
  Slider,
  TagInput,
  TextArea,
  TextInput,
  Toggle,
} from './fields'

export interface EditorCtx {
  d: SiteData
  setSection: <K extends keyof SiteData>(k: K, patch: Partial<SiteData[K]>) => void
}

/* ================= 首屏 ================= */
export function HeroEditor({ d, setSection }: EditorCtx) {
  const h = d.hero
  return (
    <SectionCard title="首屏 Hero" desc="第一眼看到的全部内容" enabled={h.enabled} onToggle={(v) => setSection('hero', { enabled: v })}>
      <Field label="顶部徽章">
        <LangInput value={h.badge} onChange={(badge) => setSection('hero', { badge })} />
      </Field>
      <Field label="姓名">
        <LangInput value={h.name} onChange={(name) => setSection('hero', { name })} />
      </Field>
      <Field label="大标题（主视觉文案）">
        <LangInput value={h.headline} onChange={(headline) => setSection('hero', { headline })} multiline rows={2} />
      </Field>
      <Field label="副标题">
        <LangInput value={h.subheadline} onChange={(subheadline) => setSection('hero', { subheadline })} multiline rows={3} />
      </Field>
      <Field label="头像（留空则显示姓名首字）">
        <ImagePicker value={h.avatar} onChange={(avatar) => setSection('hero', { avatar })} cropPreset="square" />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="主按钮文案">
          <LangInput value={h.ctaPrimary.label} onChange={(label) => setSection('hero', { ctaPrimary: { ...h.ctaPrimary, label } })} />
        </Field>
        <Field label="主按钮链接" hint="#projects 或 URL">
          <TextInput value={h.ctaPrimary.href} onChange={(href) => setSection('hero', { ctaPrimary: { ...h.ctaPrimary, href } })} placeholder="#projects" />
        </Field>
        <Field label="次按钮文案">
          <LangInput value={h.ctaSecondary.label} onChange={(label) => setSection('hero', { ctaSecondary: { ...h.ctaSecondary, label } })} />
        </Field>
        <Field label="次按钮链接">
          <TextInput value={h.ctaSecondary.href} onChange={(href) => setSection('hero', { ctaSecondary: { ...h.ctaSecondary, href } })} placeholder="#contact" />
        </Field>
      </div>
      <Field label="底部滚动关键词（跑马灯）">
        <ListEditor
          items={h.badges}
          onChange={(badges) => setSection('hero', { badges })}
          create={() => ({ zh: '', en: '' })}
          addLabel="添加关键词"
          render={(item, up) => <LangInput value={item} onChange={(v) => up(v)} />}
        />
      </Field>
    </SectionCard>
  )
}

/* ================= 关于我 ================= */
export function AboutEditor({ d, setSection }: EditorCtx) {
  const a = d.about
  return (
    <SectionCard title="关于我" enabled={a.enabled} onToggle={(v) => setSection('about', { enabled: v })}>
      <Field label="标题">
        <LangInput value={a.title} onChange={(title) => setSection('about', { title })} />
      </Field>
      <Field label="段落（可多段）">
        <ListEditor
          items={a.paragraphs}
          onChange={(paragraphs) => setSection('about', { paragraphs })}
          create={() => ({ zh: '', en: '' })}
          addLabel="添加段落"
          render={(item, up) => <LangInput value={item} onChange={(v) => up(v)} multiline rows={3} />}
        />
      </Field>
      <Field label="高亮要点（小卡片）">
        <ListEditor
          items={a.highlights}
          onChange={(highlights) => setSection('about', { highlights })}
          create={() => ({ zh: '', en: '' })}
          addLabel="添加要点"
          render={(item, up) => <LangInput value={item} onChange={(v) => up(v)} />}
        />
      </Field>
      <Field label="配图（可选）">
        <ImagePicker value={a.avatar} onChange={(avatar) => setSection('about', { avatar })} cropPreset="about" />
      </Field>
    </SectionCard>
  )
}

/* ================= 数据统计 ================= */
export function StatsEditor({ d, setSection }: EditorCtx) {
  const s = d.stats
  return (
    <SectionCard title="数据统计" desc="数字卡片，自动滚动动画" enabled={s.enabled} onToggle={(v) => setSection('stats', { enabled: v })}>
      <Field label="标题">
        <LangInput value={s.title} onChange={(title) => setSection('stats', { title })} />
      </Field>
      <Field label="统计项">
        <ListEditor
          items={s.items}
          onChange={(items) => setSection('stats', { items })}
          create={() => ({ value: '', label: { zh: '', en: '' } })}
          addLabel="添加统计项"
          render={(item, up) => (
            <div className="grid gap-3 md:grid-cols-[140px_1fr]">
              <Field label="数值" hint="如 5+ / 30+ / 1.2k">
                <TextInput value={item.value} onChange={(value) => up({ value })} placeholder="5+" />
              </Field>
              <Field label="说明">
                <LangInput value={item.label} onChange={(label) => up({ label })} />
              </Field>
            </div>
          )}
        />
      </Field>
    </SectionCard>
  )
}

/* ================= 工作经历 ================= */
export function ExperienceEditor({ d, setSection }: EditorCtx) {
  const x = d.experience
  return (
    <SectionCard title="工作经历" enabled={x.enabled} onToggle={(v) => setSection('experience', { enabled: v })}>
      <Field label="标题">
        <LangInput value={x.title} onChange={(title) => setSection('experience', { title })} />
      </Field>
      <ListEditor
        items={x.items}
        onChange={(items) => setSection('experience', { items })}
        create={() => ({
          company: { zh: '', en: '' },
          role: { zh: '', en: '' },
          period: { zh: '', en: '' },
          location: { zh: '', en: '' },
          description: { zh: '', en: '' },
          tags: [],
          logo: '',
          url: '',
        })}
        addLabel="添加工作经历"
        render={(item, up) => (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="公司">
                <LangInput value={item.company} onChange={(company) => up({ company })} />
              </Field>
              <Field label="职位">
                <LangInput value={item.role} onChange={(role) => up({ role })} />
              </Field>
              <Field label="时间">
                <LangInput value={item.period} onChange={(period) => up({ period })} placeholder="2022 — 至今" />
              </Field>
              <Field label="地点">
                <LangInput value={item.location} onChange={(location) => up({ location })} />
              </Field>
            </div>
            <Field label="职责描述">
              <LangInput value={item.description} onChange={(description) => up({ description })} multiline rows={3} />
            </Field>
            <Field label="技能标签">
              <TagInput value={item.tags} onChange={(tags) => up({ tags })} placeholder="React，输入回车添加" />
            </Field>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="公司链接（可选）">
                <TextInput value={item.url} onChange={(url) => up({ url })} placeholder="https://…" />
              </Field>
              <Field label="公司 Logo（可选）">
                <TextInput value={item.logo} onChange={(logo) => up({ logo })} placeholder="图片 URL" />
              </Field>
            </div>
          </div>
        )}
      />
    </SectionCard>
  )
}

/* ================= 教育背景 ================= */
export function EducationEditor({ d, setSection }: EditorCtx) {
  const e = d.education
  return (
    <SectionCard title="教育背景" enabled={e.enabled} onToggle={(v) => setSection('education', { enabled: v })}>
      <Field label="标题">
        <LangInput value={e.title} onChange={(title) => setSection('education', { title })} />
      </Field>
      <ListEditor
        items={e.items}
        onChange={(items) => setSection('education', { items })}
        create={() => ({
          school: { zh: '', en: '' },
          degree: { zh: '', en: '' },
          period: { zh: '', en: '' },
          description: { zh: '', en: '' },
        })}
        addLabel="添加教育经历"
        render={(item, up) => (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="学校">
                <LangInput value={item.school} onChange={(school) => up({ school })} />
              </Field>
              <Field label="学位 / 专业">
                <LangInput value={item.degree} onChange={(degree) => up({ degree })} />
              </Field>
            </div>
            <Field label="时间">
              <LangInput value={item.period} onChange={(period) => up({ period })} placeholder="2016 — 2019" />
            </Field>
            <Field label="描述（可选）">
              <LangInput value={item.description} onChange={(description) => up({ description })} multiline rows={2} />
            </Field>
          </div>
        )}
      />
    </SectionCard>
  )
}

/* ================= 技能栈 ================= */
export function SkillsEditor({ d, setSection }: EditorCtx) {
  const s = d.skills
  return (
    <SectionCard title="技能栈" enabled={s.enabled} onToggle={(v) => setSection('skills', { enabled: v })}>
      <Field label="标题">
        <LangInput value={s.title} onChange={(title) => setSection('skills', { title })} />
      </Field>
      <ListEditor
        items={s.groups}
        onChange={(groups) => setSection('skills', { groups })}
        create={() => ({ name: { zh: '', en: '' }, items: [] })}
        addLabel="添加技能分组"
        render={(group, upGroup) => (
          <div className="space-y-4">
            <Field label="分组名称">
              <LangInput value={group.name} onChange={(name) => upGroup({ name })} />
            </Field>
            <ListEditor
              items={group.items}
              onChange={(items) => upGroup({ items })}
              create={() => ({ name: '', level: 80 })}
              addLabel="添加技能"
              render={(item, up) => (
                <div className="grid grid-cols-[1fr_160px] items-end gap-3">
                  <Field label="名称">
                    <TextInput value={item.name} onChange={(name) => up({ name })} />
                  </Field>
                  <Field label="熟练度">
                    <Slider value={item.level} onChange={(level) => up({ level })} />
                  </Field>
                </div>
              )}
            />
          </div>
        )}
      />
    </SectionCard>
  )
}

/* ================= 项目 ================= */
export function ProjectsEditor({ d, setSection }: EditorCtx) {
  const p = d.projects
  return (
    <SectionCard title="项目展示" enabled={p.enabled} onToggle={(v) => setSection('projects', { enabled: v })}>
      <Field label="标题">
        <LangInput value={p.title} onChange={(title) => setSection('projects', { title })} />
      </Field>
      <ListEditor
        items={p.items}
        onChange={(items) => setSection('projects', { items })}
        create={() => ({
          name: { zh: '', en: '' },
          description: { zh: '', en: '' },
          tags: [],
          image: '',
          links: { demo: '', github: '' },
          featured: false,
        })}
        addLabel="添加项目"
        render={(item, up) => (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <Field label="项目名称">
                  <LangInput value={item.name} onChange={(name) => up({ name })} />
                </Field>
              </div>
              <div className="pt-5">
                <Toggle checked={item.featured} onChange={(featured) => up({ featured })} label="大卡片" />
              </div>
            </div>
            <Field label="项目描述">
              <LangInput value={item.description} onChange={(description) => up({ description })} multiline rows={3} />
            </Field>
            <Field label="封面图（留空自动生成渐变封面）">
              <ImagePicker value={item.image} onChange={(image) => up({ image })} cropPreset="project" />
            </Field>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Demo 链接">
                <TextInput value={item.links.demo} onChange={(demo) => up({ links: { ...item.links, demo } })} placeholder="https://…" />
              </Field>
              <Field label="GitHub 链接">
                <TextInput value={item.links.github} onChange={(github) => up({ links: { ...item.links, github } })} placeholder="https://github.com/…" />
              </Field>
            </div>
            <Field label="标签">
              <TagInput value={item.tags} onChange={(tags) => up({ tags })} placeholder="React，输入回车添加" />
            </Field>
          </div>
        )}
      />
    </SectionCard>
  )
}

/* ================= 联系 ================= */
export function ContactEditor({ d, setSection }: EditorCtx) {
  const c = d.contact
  const resume = c.resume ?? { url: '', label: { zh: '下载简历', en: 'Download Resume' } }
  return (
    <SectionCard title="联系与社交" enabled={c.enabled} onToggle={(v) => setSection('contact', { enabled: v })}>
      <Field label="标题">
        <LangInput value={c.title} onChange={(title) => setSection('contact', { title })} />
      </Field>
      <Field label="副标题">
        <LangInput value={c.subtitle} onChange={(subtitle) => setSection('contact', { subtitle })} multiline rows={2} />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="邮箱">
          <TextInput value={c.email} onChange={(email) => setSection('contact', { email })} placeholder="hello@example.com" />
        </Field>
        <Field label="电话（可选）">
          <TextInput value={c.phone} onChange={(phone) => setSection('contact', { phone })} placeholder="+86 138-0000-0000" />
        </Field>
        <Field label="微信号（可选）" hint="主页点击后复制微信号">
          <TextInput value={c.wechat} onChange={(wechat) => setSection('contact', { wechat })} placeholder="微信号" />
        </Field>
      </div>
      <Field label="离线简历" hint="支持 PDF / DOC / DOCX，≤10MB">
        <ResumePicker value={resume.url} onChange={(url) => setSection('contact', { resume: { ...resume, url } })} />
      </Field>
      <Field label="简历按钮文案">
        <LangInput value={resume.label} onChange={(label) => setSection('contact', { resume: { ...resume, label } })} />
      </Field>
      <Field label="位置">
        <LangInput value={c.location} onChange={(location) => setSection('contact', { location })} />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="按钮文案">
          <LangInput value={c.cta.label} onChange={(label) => setSection('contact', { cta: { ...c.cta, label } })} />
        </Field>
        <Field label="按钮链接">
          <TextInput value={c.cta.href} onChange={(href) => setSection('contact', { cta: { ...c.cta, href } })} placeholder="mailto:hello@example.com" />
        </Field>
      </div>
      <Field label="社交链接" hint="platform 支持 github / x / weibo / bilibili / xiaohongshu / linkedin / mail / globe">
        <ListEditor
          items={c.socials}
          onChange={(socials) => setSection('contact', { socials })}
          create={() => ({ platform: 'github', url: '', label: { zh: '', en: '' } })}
          addLabel="添加社交链接"
          render={(item, up) => (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-[140px_1fr]">
                <Field label="平台">
                  <TextInput value={item.platform} onChange={(platform) => up({ platform })} placeholder="github" />
                </Field>
                <Field label="链接">
                  <TextInput value={item.url} onChange={(url) => up({ url })} placeholder="https://…" />
                </Field>
              </div>
              <Field label="显示名称（可选）">
                <LangInput value={item.label} onChange={(label) => up({ label })} />
              </Field>
            </div>
          )}
        />
      </Field>
    </SectionCard>
  )
}
