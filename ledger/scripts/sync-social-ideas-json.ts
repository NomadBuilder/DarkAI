import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defaultSocialPostIdeasFile, serializeSocialPostIdeasFile } from '../lib/social-post-ideas-store'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outPath = join(root, 'public', 'data', 'social-post-ideas.json')

const file = defaultSocialPostIdeasFile()
mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, serializeSocialPostIdeasFile(file), 'utf8')
console.log(`Wrote ${outPath} (${file.ideas.length} ideas, version ${file.version})`)
