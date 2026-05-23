import { readFileSync, writeFileSync } from 'node:fs'
import process from 'node:process'

const rawVersion = process.argv[2] ?? process.env.RELEASE_VERSION ?? process.env.GITHUB_REF_NAME

if (!rawVersion)
  throw new Error('Missing release version')

const version = rawVersion.trim().replace(/^v/, '')

if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Z.-]+)?$/i.test(version))
  throw new Error(`Invalid semver version: ${rawVersion}`)

updateJson('package.json', (json) => {
  json.version = version
})

updateJson('src-tauri/tauri.conf.json', (json) => {
  json.version = version
})

updateCargoToml('src-tauri/Cargo.toml', version)

console.log(`Synced Tauri package version to ${version}`)

function updateJson(file, update) {
  const json = JSON.parse(readFileSync(file, 'utf8'))
  update(json)
  writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`)
}

function updateCargoToml(file, nextVersion) {
  const content = readFileSync(file, 'utf8')
  writeFileSync(file, content.replace(/^version = ".+"$/m, `version = "${nextVersion}"`))
}
