const codeReader    = require('./code-reader')
const { globalEnv } = require('./environment')

const InputStream = require('./interpreter/input-stream')
const TokenStream = require('./interpreter/token-stream')
const parse       = require('./interpreter/parser')
const evaluate    = require('./interpreter/evaluator')

const testString = 'sum = function (x, y) x + y; println(sum(2, 3));'

function init() {
  const codeBase = codeReader()

  Object.values(codeBase).forEach(codeString => {
    console.log(codeString)

    const AST = parse(TokenStream(InputStream(codeString)))

    evaluate(AST, globalEnv)
  })
}

init()
