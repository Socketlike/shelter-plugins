/**
 * meant to be run after `lune ci`.
 * any other scenarios are not considered.
 */

import fs from 'fs/promises'
import path from 'path'

/** @type {Record<string, { name?: string, author?: string, description?: string, hash?: string }>} */
const index = await fs
  .readdir('./dist')
  .then((plugins) =>
    Promise.all(
      plugins.map(async (plugin) => ({
        name: plugin,
        manifest:
          (await fs
            .readFile(path.join('./dist', plugin, 'plugin.json'))
            .then((buf) => JSON.parse(buf.toString('utf8')))
            .catch((e) => {
              console.error('could not index', plugin, '\n', e)
            })) || {},
      })),
    ),
  )
  .then((plugins) =>
    plugins.reduce((acc, { name, manifest }) => {
      acc[name] = manifest

      return acc
    }, {}),
  )
  .catch((e) => {
    console.error('could not create index\n', e)
  })

if (index)
  try {
    await fs.writeFile('./dist/index.json', JSON.stringify(index))
  } catch (e) {
    console.error('could not write index\n', e)
  }

await Promise.all([
  fs.copyFile('./public/404.html', './dist').catch((e) => {
    console.error('could not copy 404.html to dist\n', e)
  }),
  fs.copyFile('./public/index.html', './dist').catch((e) => {
    console.error('could not copy index.html to dist\n', e)
  }),
])
