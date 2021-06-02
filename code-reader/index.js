const fs = require('fs')
const path = require('path')
const DIR_PATH = path.resolve(__dirname, '../test-code')

function convertTxtToString() {
  const data = {}
  try {
    const files = fs.readdirSync(DIR_PATH)
    for (let file of files) {
      const filePath = path.resolve(DIR_PATH, file)
      const fileData = fs.readFileSync(filePath, 'utf8')
      data[file] = fileData
    }
  } catch (e) {
    console.error('Convertation error: ', e)
    throw e
  }
  return data
}

module.exports = convertTxtToString
