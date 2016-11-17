#!/usr/bin/env node

// let INFO = DEBUG = console.log
let INFO = DEBUG = function(){}

const fs = require('fs')
let filename = process.argv[2]
let filetype = process.argv[3]
if(!filename) filename = '/usr/share/nvim/runtime/doc/help.txt'
// if(!filename) filename = '/home/nilsb/.cache/vim-normal-buffer-man/ls.man'

// const filename = '/home/nilsb/.vim/etc/jo.help'
const str = fs.readFileSync(filename).toString()

const globalConfig = {
  help: {
    filenameMatch: /.*vim.*\.txt$/i,
    tokens: [
      {
        type: 'header',
        re: /(={2,}\n)(.+)\n/,
        wanted: [2],
      },
      {
        type: 'header2',
        // re: '(\n*)(^[^ \t].+?) ~$',
        // re: /^([^\\n].+)(\\*\\w+\\*) ~$/igm,
        re: /^(.+) ~$/igm,
        wanted: [1],
      }
    ],
  },
  text: {
    filenameMatch: /\.(txt|text)$/i,
    tokens: [
      {
        type: 'header',
        re: /^([=#/'"-]{3,}\s+)(.+?)[\ =#/'"-]*$/gmi,
        wanted: [2],
      },
    ],
  },
  man: {
    filenameMatch: /\.man$/i,
    tokens: [
      {
        type: 'header',
        re: /^([A-Z ]+)$/gm,
        wanted: [1],
      }
    ],
  },
  markdown: {
    filenameMatch: /\.md$/i,
    tokens: [
      {
        type: 'header',
        re: /^(#{1,})(.+)$/gm,
        wanted: [2],
      }
    ],
  },
  javascript: {
    filenameMatch: /\.js$/i,
    tokens: [
      {
        type: 'class',
        re: /(class )(\w+)/gm,
        wanted: [2],
      },
      {
        type: 'exports',
        re: /(module.exports[\s=]+)(\w+)/gm,
        wanted: [2],
      },
      {
        type: 'function',
        re: /^function(\s*)(\w+)([\s]*)(\([^\n]*\)\s*\{)/gm,
        wanted: [2],
      },
      {
        type: 'function2',
        re: /(\w+)(\s*:+\s*)(function)/gm,
        wanted: [1],
      },
    ],
  },
  perl: {
    filenameMatch: /\.p(l|m)$/i,
    tokens: [
      {
        type: 'function',
        re: /(sub)([\s]+)(\w+)/gm,
        wanted: [3],
      },
    ],
  },
  vim: {
    filenameMatch: /\.vim$/i,
    tokens: [
      {
        type: 'function',
        re: /(function)([\!\s]*)([\w\:]+)(\s*\()/gm,
        wanted: [3],
      },
    ],
  },
  java: {
    filenameMatch: /\.java$/i,
    tokens: [
      {
        type: 'class',
        re: /(class)([\s]+)([\w]+)/gm,
        wanted: [3],
      },
      {
        type: 'method',
        re: /(public|private)((\s*\w*)(\s+))*((?!(s|g)et\w+)[\w]+)(\s*\()/gm,
        wanted: [5],
      },
    ],
  },
}

let config
if(! filetype) {
  for(filetype of Object.keys(globalConfig)) {
    let filetypeConfig = globalConfig[filetype]
    if(filename.match(filetypeConfig.filenameMatch)) {
      break
    }
  }
}

if(!globalConfig[filetype]) {
  filetype = 'text'
}

config = globalConfig[filetype]
config.filetype = filetype

if(!config) {
  INFO('Filetype not recognized - using text')
  config = globalConfig.text
}
else {
  DEBUG('Using config:', config)
}
INFO('Using filetype: ' + config.filetype)


for(let token of config.tokens) {
  findMatches(token)
}

function findMatches(token) {
  // TODO
  let lastRowStartOffset = 0
  let row = 1
  let newlines = findNewlines()
  const re = token.re
  const wantedMatches = new Set(token.wanted)

// note: match.index is the same for all capture groups even non capturing (?:)
while ((match = re.exec(str)) !== null) {
  // console.log('mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm')
  // console.log(match)
  let index = match.index

  if(match[0] == '') throw 'Nothing could be matched.'

  // process.exit(1)

  let wantedMatch
  for(i = 1 ; i <= match.length ; i++) {
    // console.log('pppppppppppppppppppp' + i + '/' + match.length)
    let matchPart = match[i]
    // console.log('matchPart:' + matchPart)
    if(!matchPart) continue
    if(wantedMatches.has(i)) {
      wantedMatch = matchPart + ' (' + token.type + ')'
      break
    }
    index = index + matchPart.length
  }

  while(newlines[0] < index) {
    lastRowStartOffset = newlines.shift()
    row++
  }
  let col = index - lastRowStartOffset

  console.log([filename, row, col, wantedMatch].join(':'))
}
}

// TODO maybe use split or similar
function findNewlines() {
  let re = /\n/gm
  let newlines = []
  while ((match = re.exec(str)) !== null) {
    newlines.push(match.index)
  }
  return newlines
}

