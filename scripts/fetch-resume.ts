#!/usr/bin/env tsx

/**
 * Fetches the resume markdown and PDF from the standalone repo and transforms
 * the markdown for use in the Astro site.
 *
 * Source: https://github.com/denniskasper/resume
 */

import { existsSync } from 'fs'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { dirname, join } from 'path'

const REPO = 'denniskasper/resume'
const RESUME_MD_URL = `https://raw.githubusercontent.com/${REPO}/main/dennis_kasper_resume.md`
const RESUME_PDF_URL = `https://github.com/${REPO}/releases/latest/download/dennis_kasper_resume.pdf`

// Set to a local checkout's markdown file to preview unpublished resume changes.
const LOCAL_RESUME_MD_PATH = process.env.RESUME_MD_PATH

const OUTPUT_MD_PATH = 'src/pages/resume.md'
const OUTPUT_PDF_PATH = 'public/resume.pdf'

// GitHub Actions and Cloudflare Workers Builds
const IS_CI = Boolean(process.env.CI || process.env.WORKERS_CI)

/** The source could not be downloaded, as opposed to its content being wrong. */
class DownloadError extends Error {
  constructor(
    url: string,
    reason: string,
    readonly status?: number
  ) {
    super(`Failed to fetch ${url}: ${reason}`)
  }
}

async function download(url: string): Promise<Response> {
  let response: Response
  try {
    response = await fetch(url)
  } catch (err) {
    // fetch() reports network failures as a bare "fetch failed"; the cause says why.
    const { message, cause } = err as Error
    throw new DownloadError(url, cause instanceof Error ? cause.message : message)
  }
  if (!response.ok) {
    throw new DownloadError(url, `${response.status} ${response.statusText}`, response.status)
  }
  return response
}

const FRONTMATTER = `---
title: 'Resume | Dennis Kasper'
description: 'Resume of Dennis Kasper, AI, DevOps and simulation engineer: experience in full-stack development, cloud infrastructure and data platforms in the automotive industry.'
layout: '../layouts/layout.astro'
author: 'Dennis Kasper'
---`

const DOWNLOAD_BUTTON = `<a href="/resume.pdf" download="dennis-kasper-resume.pdf" class="group flex items-center gap-2 bg-accent/15 text-accent-ink dark:text-accent-light border border-accent/20 px-4 py-2.5 rounded-lg hover:bg-accent/25 hover:border-accent/40 transition-all duration-300 text-sm font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-light dark:focus-visible:ring-offset-dark">
    <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    Download
  </a>`

async function loadMarkdown(): Promise<string> {
  if (LOCAL_RESUME_MD_PATH) {
    console.log(`Reading markdown from ${LOCAL_RESUME_MD_PATH}...`)
    return readFile(LOCAL_RESUME_MD_PATH, 'utf-8')
  }

  console.log(`Fetching markdown from ${RESUME_MD_URL}...`)

  return (await download(RESUME_MD_URL)).text()
}

async function writeResumePage(): Promise<void> {
  let markdown = await loadMarkdown()

  // Remove the profile photo img tag (not needed for web version)
  markdown = markdown.replace(/<img[^>]*profile-photo[^>]*>\n*/i, '')

  // Drop the self-referential homepage link from the contact line — redundant on
  // the site itself. The PDF keeps it (it is built in the resume repo).
  markdown = markdown.replace(/\s*\|\s*\[denniskasper\.com\]\([^)]*\)/i, '')
  markdown = markdown.replace(/\[denniskasper\.com\]\([^)]*\)\s*\|\s*/i, '')

  // Fail the build rather than silently shipping the link if the upstream
  // contact line is ever reworded and the patterns above stop matching.
  const contactLine = markdown.split('\n').find((line) => line.includes('mailto:')) ?? ''
  if (/denniskasper\.com/i.test(contactLine)) {
    throw new Error('Failed to strip the denniskasper.com link — the upstream contact line format changed.')
  }

  // Certificate links are absolute upstream so they also work in the PDF. On the
  // site, serve them from the current origin and open them in a new tab.
  markdown = markdown.replace(
    /\[([^\]]+)\]\(https:\/\/denniskasper\.com(\/certificates\/[^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>'
  )

  // Replace h1 name with flex container including download button
  markdown = markdown.replace(
    /^# (.+)$/m,
    `<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
  <h1>$1</h1>
  ${DOWNLOAD_BUTTON}
</div>`
  )

  // Wrap everything in markdown-content div for styling
  const content = `${FRONTMATTER}

<div class="markdown-content">

${markdown.trim()}

</div>
`

  const outputPath = join(process.cwd(), OUTPUT_MD_PATH)
  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, content, 'utf-8')

  console.log(`Markdown written to ${OUTPUT_MD_PATH}`)
}

async function fetchPdf(): Promise<void> {
  console.log(`Fetching PDF from ${RESUME_PDF_URL}...`)

  let response: Response
  try {
    response = await download(RESUME_PDF_URL)
  } catch (err) {
    // Locally a missing release is only a warning. In CI it fails the build so a
    // broken Download link never ships.
    if (err instanceof DownloadError && err.status === 404 && !IS_CI) {
      console.warn(`Warning: PDF not found at ${RESUME_PDF_URL}. Make sure you have published a release.`)
      console.warn(`Run: gh release create v1.0.0 dennis_kasper_resume.pdf --repo ${REPO}`)
      return
    }
    throw err
  }

  const buffer = await response.arrayBuffer()
  const outputPath = join(process.cwd(), OUTPUT_PDF_PATH)
  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, Buffer.from(buffer))

  console.log(`PDF written to ${OUTPUT_PDF_PATH}`)
}

/**
 * Locally, an unreachable GitHub must not block `pnpm dev` when an earlier run
 * already produced the file. CI always fails, so a deploy never ships a stale resume.
 */
async function keepExistingIfOffline(outputPath: string, produce: () => Promise<void>): Promise<void> {
  try {
    await produce()
  } catch (err) {
    if (!(err instanceof DownloadError) || IS_CI || !existsSync(outputPath)) throw err
    console.warn(`Warning: ${err.message}. Keeping the existing ${outputPath}.`)
  }
}

async function main(): Promise<void> {
  await keepExistingIfOffline(OUTPUT_MD_PATH, writeResumePage)
  await keepExistingIfOffline(OUTPUT_PDF_PATH, fetchPdf)
}

main().catch((err: Error) => {
  console.error('Error fetching resume:', err.message)
  process.exit(1)
})
