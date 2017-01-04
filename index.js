#!/usr/bin/env node

// let INFO = DEBUG = console.log
const INFO = function() {}
const DEBUG = INFO

const fs = require(`fs`)
let filename = process.argv[2]
let filetype = process.argv[3]

if (!filename) {
  filename = `/usr/share/nvim/runtime/doc/help.txt`
}

const str = fs.readFileSync(filename).toString()

const globalConfig = {
  helpxx: {
    filenameMatch: /.*vim.*\.txt$/i
    , tokens: [
      {
        type: `header`
        , re: /(={2,}\n)(.+)\n/
        , wanted: [2]
      }
      , {
        type: `header2`

        // re: '(\n*)(^[^ \t].+?) ~$',
        // re: /^([^\\n].+)(\\*\\w+\\*) ~$/igm,
        , re: /^(.+) ~$/igm
        , wanted: [1]
      }
    ]
  }
  , text: {
    filenameMatch: /\.(txt|text)$/i
    , tokens: [
      {
        type: `header`

        , re: /^([=#/'"-]{3,}\s+)(.+?)[\ =#/'"-]*$/gmi

        // , re: /^([=#/'"-]{2,2})([=#/'"-]{0,})(\s+)(.+?)((\s)[\ =#/'"-])*$/gmi
        , wanted: [2]
      }
      , {
        type: `header2`

        , re: /^([=#/'"-]{2,2}\s+)(.+?)[\ =#/'"-]*$/gmi
        , wanted: [2]
        , transform(match) {
          return match.replace(/^/, ` - `)
        }
      }
    , ]
  }
  , man: {
    filenameMatch: /\.man$/i
    , tokens: [
      {
        type: `header`
        , re: /^([A-Z ]+)$/gm
        , wanted: [1]
      }
    ]
  }
  , markdown: {
    filenameMatch: /\.md$/i
    , tokens: [
      {
        type: `header`
        , re: /^(#)(#*.+)$/gm
        , wanted: [2]
      }
    ]
  }
  , javascript: {
    filenameMatch: /\.js$/i
    , tokens: [
      {
        type: `class`
        , re: /(class )(\w+)/gm
        , wanted: [2]
      }
      , {
        type: `exports`
        , re: /(module.exports[\s=]+)(\w+)/gm
        , wanted: [2]
      }
      , {
        type: `function`
        , re: /^function(\s*)(\w+)([\s]*)(\([^\n]*\)\s*\{)/gm
        , wanted: [2]
      }
      , {
        type: `function2`
        , re: /(\w+)(\s*:+\s*)(function)/gm
        , wanted: [1]
      }
    , ]
  }
  , perl: {
    filenameMatch: /\.p(l|m)$/i
    , tokens: [
      {
        type: `function`
        , re: /(sub)([\s]+)(\w+)/gm
        , wanted: [3]
      }
    , ]
  }
  , vim: {
    filenameMatch: /\.vim$/i
    , tokens: [
      {
        type: `function`
        , re: /(function)([\!\s]*)([#\w\:]+)(\s*\()/gm
        , wanted: [3]
      }
    , {
        example: `"### header ####`
        , type: `header`
        , re: /^("### )(.+)( #*)$/gm
        , wanted: [2]
    }
    ]
  }
  , java: {
    filenameMatch: /\.java$/i
    , tokens: [
      {
        type: `class`
        , re: /(class)([\s]+)([\w]+)/gm
        , wanted: [3]
      }
      , {
        type: `method`
        , re: /(public|private)((\s*\w*)(\s+))*((?!(s|g)et\w+)[\w]+)(\s*\()/gm
        , wanted: [5]
      }
    , ]
  }
  , yaml: {
    filenameMatch: /\.(yaml|swagger)$/i
    , tokens: [
      {
        type: `header`
        , re: /^(\w+):/gm
        , wanted: [1]
      }

      // , {
      //   type: `header2`
      //   , re: /^(\s+\w+):/gm
      //   , wanted: [1]
      // }
    ]
  }
  , snippets: {
    filenameMatch: /\.(snippets)$/i
    , tokens: [
      {
        type: `header`
        , re: /^(snippet\s+)(.+$)/gm
        , wanted: [2]
      }
    ]
  }
}

let config

if (! filetype) {
  for (filetype of Object.keys(globalConfig)) {
    const filetypeConfig = globalConfig[filetype]

    if (filename.match(filetypeConfig.filenameMatch)) {
      break
    }
  }
}

if (!globalConfig[filetype]) {
  filetype = `text`
}

config = globalConfig[filetype]
config.filetype = filetype

if (!config) {
  INFO(`Filetype not recognized - using text`)
  config = globalConfig.text
} else {
  DEBUG(`Using config:`, config)
}
INFO(`Using filetype: ${config.filetype}`)

for (const token of config.tokens) {
  findMatches(token)
}

function findMatches(token) {
  // TODO
  let lastRowStartOffset = 0
  let row = 1
  const newlines = findNewlines()
  const re = token.re
  const wantedMatches = new Set(token.wanted)

// note: match.index is the same for all capture groups even non capturing (?:)
  let match

  while ((match = re.exec(str)) !== null) {
  // DEBUG('Match')
  // DEBUG(match)
    let index = match.index

    if (match[0] == ``) {
      throw `Nothing could be matched.`
    }

  // process.exit(1)

    let wantedMatch = ``
    let i

    for (i = 1; i <= match.length; i++) {
    // DEBUG('matchPart: ' + i + '/' + match.length)
      const matchPart = match[i]

    // DEBUG('matchPart:' + matchPart)

      if (!matchPart) {
        continue
      }
      if (wantedMatches.has(i) && matchPart.match(/\w/)) {
        if (wantedMatch) {
          wantedMatch += ` `
        }
        wantedMatch += `${matchPart}`

        // wantedMatch = matchPart
      }
      index = index + matchPart.length
    }

    if (token.transform != undefined) {
      wantedMatch = token.transform(wantedMatch)
    }

    // wantedMatch += ` (${token.type})`

    while (newlines[0] < index) {
      lastRowStartOffset = newlines.shift()
      row++
    }
    const col = index - lastRowStartOffset

    console.log([filename, row, col, wantedMatch].join(`:`))
  }
}

// TODO maybe use split or similar
function findNewlines() {
  const re = /\n/gm
  const newlines = []

  let match

  while ((match = re.exec(str)) !== null) {
    newlines.push(match.index)
  }
  return newlines
}
