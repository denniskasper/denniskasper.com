#!/usr/bin/env tsx

/**
 * Fetches the resume markdown and PDF from the standalone repo and transforms
 * the markdown for use in the Astro site.
 *
 * Source: https://github.com/denniskasper/resume
 */

import { writeFile, mkdir } from 'fs/promises'
import { dirname, join } from 'path'

const REPO = 'denniskasper/resume'
const RESUME_MD_URL = `https://raw.githubusercontent.com/${REPO}/main/dennis_kasper_resume.md`
const RESUME_PDF_URL = `https://github.com/${REPO}/releases/latest/download/dennis_kasper_resume.pdf`

const OUTPUT_MD_PATH = 'src/pages/resume.md'
const OUTPUT_PDF_PATH = 'public/resume.pdf'

const FRONTMATTER = `---
title: 'resume | Dennis Kasper'
layout: '../layouts/layout.astro'
author: 'Dennis Kasper'
---`

const DOWNLOAD_BUTTON = `
<div class="mt-4 mb-6">
  <a href="/resume.pdf" download="dennis-kasper-resume.pdf">
    <button class="bg-blue-600 bg-opacity-40 text-white px-3 py-1.5 rounded-md hover:bg-opacity-70 transition text-sm font-normal">
      Download Resume (PDF)
    </button>
  </a>
</div>
`

async function fetchMarkdown(): Promise<void> {
  console.log(`Fetching markdown from ${RESUME_MD_URL}...`)

  const response = await fetch(RESUME_MD_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch markdown: ${response.status} ${response.statusText}`)
  }

  let markdown = await response.text()

  // Remove the profile photo img tag (not needed for web version)
  markdown = markdown.replace(/<img[^>]*profile-photo[^>]*>\n*/i, '')

  // Find the position after the contact links line to insert the download button
  const contactLineRegex = /(\[Email\].*\[LinkedIn\].*\[GitHub\].*\[denniskasper\.com\].*)\n/
  const match = markdown.match(contactLineRegex)

  if (match) {
    markdown = markdown.replace(contactLineRegex, `$1\n${DOWNLOAD_BUTTON}\n`)
  }

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

  const response = await fetch(RESUME_PDF_URL)
  if (!response.ok) {
    if (response.status === 404) {
      console.warn(`Warning: PDF not found at ${RESUME_PDF_URL}. Make sure you have published a release.`)
      console.warn(`Run: gh release create v1.0.0 dennis_kasper_resume.pdf --repo ${REPO}`)
      return
    }
    throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`)
  }

  const buffer = await response.arrayBuffer()
  const outputPath = join(process.cwd(), OUTPUT_PDF_PATH)
  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, Buffer.from(buffer))

  console.log(`PDF written to ${OUTPUT_PDF_PATH}`)
}

async function main(): Promise<void> {
  await fetchMarkdown()
  await fetchPdf()
}

main().catch((err: Error) => {
  console.error('Error fetching resume:', err.message)
  process.exit(1)
})
