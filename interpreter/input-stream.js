function InputStream(input) {
  let pos = 0, line = 1, col = 0;

  function next() {
    let ch = input.charAt(pos++);
    if (ch == "\n") line++, col = 0; else col++;
    return ch;
  }

  function peek() {
    return input.charAt(pos);
  }

  function eof() {
    return peek() == "";
  }

  function croak(msg) {
    throw new Error(msg + " (" + line + ":" + col + ")");
  }

  return {
    next: next,
    peek: peek,
    eof: eof,
    croak: croak,
  }
}

module.exports = InputStream
