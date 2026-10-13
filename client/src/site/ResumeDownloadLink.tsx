import { useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { useSite } from '../lib/site'
import { useLang } from '../lib/i18n'
import type { ResumeConfig } from '../lib/types'

export default function ResumeDownloadLink({
  resume,
  children,
  ...props
}: {
  resume: ResumeConfig
  children?: ReactNode
  className?: string
  title?: string
  'aria-label'?: string
}) {
  const { t } = useSite()
  const { lang } = useLang()
  const notice = t(resume.notice).trim()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  return (
    <>
      {notice ? (
        <button {...props} type="button" onClick={() => dialogRef.current?.showModal()}>
          {children}
        </button>
      ) : (
        <a {...props} href={resume.url} download>{children}</a>
      )}
      {notice && (
        <dialog
          ref={dialogRef}
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-surface p-6 text-ink shadow-2xl backdrop:bg-black/60"
        >
          <h2 id={titleId} className="text-lg font-semibold">
            {lang === 'en' ? 'Resume version notice' : '简历版本提示'}
          </h2>
          <p id={descriptionId} className="mt-3 text-sm leading-relaxed text-muted">{notice}</p>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              autoFocus
              onClick={() => dialogRef.current?.close()}
              className="rounded-full border border-line px-5 py-2.5 text-sm transition-colors hover:bg-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              {lang === 'en' ? 'Cancel' : '取消'}
            </button>
            <a
              href={resume.url}
              download
              onClick={() => dialogRef.current?.close()}
              className="btn-gradient-hover rounded-full border border-line px-5 py-2.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              {lang === 'en' ? 'Continue download' : '继续下载'}
            </a>
          </div>
        </dialog>
      )}
    </>
  )
}
