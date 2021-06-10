const codeReader    = require('./code-reader')
const { globalEnv } = require('./environment')

const InputStream = require('./interpreter/input-stream')
const TokenStream = require('./interpreter/token-stream')
const parse       = require('./interpreter/parser')
const evaluate    = require('./interpreter/evaluator')

function init() {
  const codeBase = codeReader()

  Object.values(codeBase).forEach(codeString => {
    const AST = parse(TokenStream(InputStream(codeString)))
    evaluate(AST, globalEnv)
  })
}

init()
