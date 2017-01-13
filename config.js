module.exports = {
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
        , transform(matches) {
            return ` - ` + matches.join(`:`)
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
  , mocha: {
    filenameMatch: /\.js$/i
    , tokens: [
      {
        type: `testError`
        // including stacktrace:
        // , re: /^(\s*at .+ \()(.+\/.+?)(\))$/gm
        // Javascript does not support look behind...
        // , re: /(?<!\s*at.*?\n)(\s*at .+? \()(.+?)(\))$/gm
        // at Context.it (/h....st/test.js:21:16)
        // at callFn (/h..../lib/runnable.js:326:21)
        // , re: /(^\s+at.*?)(\/.*?)[\)\n]+(^.*at.*\n)*/gm
        // , re: /\s+\d+\)([.\n]*)(\s+at\s)(.+?)/gm
        // Javascript has no /s - /m with [\s\S] emulates it
        // , re: /(\s+\d+\))([\s\S]*?)(\s+at\s+.+\()(.+)(\))$/gm
        , re: /(\s+\d+\).+$\n\n)([\s\S]*?)(\s+at\s+.+\()(.+)(\))$/gm
        , wanted: [4]
        , transform(matches) {
            return matches[0] + `:Test error`
        }
      }
      , {
          type: `implementationError`
          // TypeError: Cannot read property 'type' of undefined
          //  at /home/nilsb/src/es-strip-semicolons/index.js:32:19
          , re: /\s+\d+\)(.+?)\n(\s*)(.+?)\n(\s+at\s)(.+?)$/gm
          , wanted: [3,5]
          , transform(matches) {
            return matches[1] + `:` + matches[0]
          }
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
        , transform(matches) {
            return matches.join(`:`) + ` - `
        }
      }
    , {
        example: `"### header ####`
        , type: `header`
        , re: /^("### )(.+)([\s#]*)$/gm
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

