import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import process from 'node:process'

const assetsDir = process.argv[2] ?? 'release-assets'
const releaseTag = process.env.RELEASE_TAG ?? process.env.GITHUB_REF_NAME
const repository = process.env.GITHUB_REPOSITORY

if (!releaseTag)
  throw new Error('Missing RELEASE_TAG or GITHUB_REF_NAME')

if (!repository)
  throw new Error('Missing GITHUB_REPOSITORY')

const files = walkFiles(assetsDir)
const platforms = {}

for (const signaturePath of files.filter(file => file.endsWith('.sig'))) {
  const artifactPath = signaturePath.slice(0, -4)

  if (!existsSync(artifactPath))
    continue

  const target = getUpdaterTarget(artifactPath)

  if (!target)
    continue

  const artifactName = basename(artifactPath)

  platforms[target] = {
    signature: readFileSync(signaturePath, 'utf8').trim(),
    url: `https://github.com/${repository}/releases/download/${encodeURIComponent(releaseTag)}/${encodeURIComponent(artifactName)}`,
  }
}

if (Object.keys(platforms).length === 0)
  throw new Error('No updater artifacts with matching .sig files were found')

writeFileSync(join(assetsDir, 'latest.json'), `${JSON.stringify({
  version: releaseTag,
  notes: `ROBOFLOW ${releaseTag}`,
  pub_date: new Date().toISOString(),
  platforms,
}, null, 2)}\n`)

function walkFiles(dir) {
  return readdirSync(dir)
    .flatMap((name) => {
      const path = join(dir, name)

      return statSync(path).isDirectory() ? walkFiles(path) : path
    })
}

function getUpdaterTarget(artifactPath) {
  const name = basename(artifactPath).toLowerCase()

  if (name.endsWith('.exe'))
    return 'windows-x86_64-nsis'

  if (name.endsWith('.msi'))
    return 'windows-x86_64-msi'

  if (name.endsWith('.deb'))
    return 'linux-x86_64-deb'

  if (name.endsWith('.rpm'))
    return 'linux-x86_64-rpm'

  if (name.endsWith('.appimage'))
    return 'linux-x86_64-appimage'

  return undefined
}
