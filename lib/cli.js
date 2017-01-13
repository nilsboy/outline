'use strict'

const conf = require('conf-simple')
const fs = require('fs')
const getStdin = require('get-stdin')
const formatter = require('..')

module.exports = main
async function main() {
  
  let data
  if(!process.stdin.isTTY) {
    data = await getStdin().then(data => {return data})
  }

  let filename = conf.get(`filename`)
  let filetype = conf.get(`filetype`)

  if (conf.get(`test`)) {
    filename = `/usr/share/nvim/runtime/doc/help.txt`
  }

  if (data) {
    process.stdout.write(formatter(
      filename, data, filetype).join(`\n`) + `\n`)
    process.exit(0)
  }

  if(!filename) {
      console.error('Input file required')
      process.exit(1)
  }

  process.stdout.write(formatter(
      filename
      , fs.readFileSync(filename, 'utf8')
      , filetype
  ).join('\n') + `\n`)
}

