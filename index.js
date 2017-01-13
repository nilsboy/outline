let INFO = DEBUG = console.error

const globalConfig = require(`./config`)

module.exports = format

function format(filename, data, filetype) {
  let config

  if (!filetype && filename) {
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

  DEBUG(`Using filetype: ${filetype}`)

  config = globalConfig[filetype]
  config.filetype = filetype

  if (!config) {
    INFO(`Filetype not recognized - using text`)
    config = globalConfig.text
  } else {
    DEBUG(`Using config:`, config)
  }
  INFO(`Using filetype: ${config.filetype}`)

  let result = []
  for (const token of config.tokens) {
    result.push(...findMatches(filename, data, token))
  }

  return result
}

function findMatches(filename, data, token) {
  // TODO
  let lastRowStartOffset = 0
  let row = 1
  const newlines = findNewlines(data)
  const re = token.re
  const wantedMatches = new Set(token.wanted)

// Note: match.index is the same for all capture groups even non capturing (?:)
  let match

  let result = []

  while ((match = re.exec(data)) !== null) {
  // DEBUG('Match')
  // DEBUG(match)
    let index = match.index

    if (match[0] == ``) {
      throw `Nothing could be matched.`
    }

  // process.exit(1)

    let matches = []
    let i

    for (i = 1; i <= match.length; i++) {
    // DEBUG('matchPart: ' + i + '/' + match.length)
      const matchPart = match[i]

    // DEBUG('matchPart:' + matchPart)

      if (!matchPart) {
        continue
      }
      if (wantedMatches.has(i) && matchPart.match(/\w/)) {
        matches.push(matchPart)
      }
      index = index + matchPart.length
    }

    let wantedMatch
    if (token.transform != undefined) {
      wantedMatch = token.transform(matches)
    } else {
      wantedMatch = matches.join(`#####`)
    }

    while (newlines[0] < index) {
      lastRowStartOffset = newlines.shift()
      row++
    }
    const col = index - lastRowStartOffset

    if(!filename) {
      result.push(wantedMatch)
    } else {
      result.push([filename, row, col, wantedMatch].join(`:`))
    }
  }

  return result
}

// TODO maybe use split or similar
function findNewlines(data) {
  const re = /\n/gm
  const newlines = []

  let match

  while ((match = re.exec(data)) !== null) {
    newlines.push(match.index)
  }
  return newlines
}
