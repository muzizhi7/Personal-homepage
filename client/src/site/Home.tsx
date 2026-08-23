import type { ReactNode } from 'react'
import { useSite } from '../lib/site'
import type { SectionKey } from '../lib/types'
import Navbar from './Navbar'
import Hero from './Hero'
import { About, Education, Experience, Projects, Skills, Stats } from './Sections'
import Contact from './Contact'
import Footer from './Footer'

export default function Home() {
  const { site } = useSite()
  if (!site) return null

  const map: Record<SectionKey, ReactNode> = {
    hero: <Hero />,
    about: <About />,
    stats: <Stats />,
    experience: <Experience />,
    education: <Education />,
    skills: <Skills />,
    projects: <Projects />,
    contact: <Contact />,
  }

  return (
    <main className="relative min-h-screen">
      <Navbar />
      {site.layout.sections.map((k) => map[k])}
      <Footer />
    </main>
  )
}
