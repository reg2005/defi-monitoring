import test from 'japa'
import { getPriceFromHTML } from './index'
import fs from 'fs'
test.group('Admin test', () => {
  test('login', async (assert) => {
    const result = getPriceFromHTML(fs.readFileSync(__dirname + '/assets/test.html', 'utf-8'))
    console.log(result)
  })
})
