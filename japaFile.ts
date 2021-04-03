import 'reflect-metadata'
import { join } from 'path'
// import getPort from 'get-port'
import { configure } from 'japa'
import sourceMapSupport from 'source-map-support'

process.env.NODE_ENV = 'testing'
process.env.ADONIS_ACE_CWD = join(__dirname)
sourceMapSupport.install({ handleUncaughtExceptions: false })

// async function startHttpServer() {
//   const { Ignitor } = await import('@adonisjs/core/build/src/Ignitor')
//   process.env.PORT = String(await getPort())
//   try {
//     await new Ignitor(__dirname).httpServer().start()
//   } catch (e) {
//     console.error(e)
//   }
// }

function getTestFiles() {
  let userDefined = process.argv.slice(2)[0]
  if (!userDefined) {
    return ['test/**/*.spec.ts', 'libsTs/**/*.spec.ts']
  }

  return [`${userDefined}`]
}

/**
 * Configure test runner
 */
configure({
  files: getTestFiles(),
  after: [
    // rollbackMigrations
  ],
})
