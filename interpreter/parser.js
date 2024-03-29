const TOKENS = {
  "=": 1,
  "||": 2,
  "&&": 3,
  "<": 7, ">": 7, "<=": 7, ">=": 7, "==": 7, "!=": 7,
  "+": 10, "-": 10,
  "*": 20, "/": 20, "%": 20,
}

const FALSE = { type: "bool", value: false };

function parse(input) {

  function is_punc(ch) {
    const tok = input.peek();
    return tok && tok.type == "punc" && (!ch || tok.value == ch) && tok;
  }

  // function is_index(ch) {
  //   const tok = input.peek();
  //   return tok && tok.type == "index" && (!ch || tok.value == ch) && tok;
  // }

  function is_kw(kw) {
    const tok = input.peek();
    return tok && tok.type == "kw" && (!kw || tok.value == kw) && tok;
  }

  function is_op(op) {
    const tok = input.peek();
    return tok && tok.type == "op" && (!op || tok.value == op) && tok;
  }

  function skip_punc(ch) {
    if (is_punc(ch)) input.next();
    else input.croak("Expecting punctuation: \"" + ch + "\"");
  }

  function skip_kw(kw) {
    if (is_kw(kw)) input.next();
    else input.croak("Expecting keyword: \"" + kw + "\"");
  }

  // function skip_op(op) {
  //   if (is_op(op)) input.next();
  //   else input.croak("Expecting operator: \"" + op + "\"");
  // }

  function unexpected() {
    input.croak("Unexpected token: " + JSON.stringify(input.peek()));
  }

  function maybe_binary(left, my_prec) {
    const tok = is_op();
    if (tok) {
      const his_prec = TOKENS[tok.value];

      if (his_prec > my_prec) {
        input.next();

        return maybe_binary({
            type: tok.value == "=" ? "assign" : "binary",
            operator: tok.value,
            left: left,
            right: maybe_binary(parse_atom(), his_prec)
        }, my_prec);
      }
    }
    return left;
  }

  function delimited(start, stop, separator, parser) {
    const a = [];
    let first = true;

    skip_punc(start);
    while (!input.eof()) {
      if (is_punc(stop)) break;
      if (first) first = false; else skip_punc(separator);
      if (is_punc(stop)) break;

      a.push(parser());
    }
    skip_punc(stop);
    return a;
  }

  function parse_call(func) {
    return {
      type: "call",
      func: func,
      args: delimited("(", ")", ",", parse_expression),
    };
  }

  function parse_varname() {
    const name = input.next();
    if (name.type != "var") input.croak("Expecting variable name");
    return name.value;
  }

  function parse_if() {
    skip_kw("if");
    const cond = parse_expression();

    if (!is_punc("{")) skip_kw("then");

    const then = parse_expression();
    const ret = {
      type: "if",
      cond,
      then,
    };

    if (is_kw("else")) {
        input.next();
        ret.else = parse_expression();
    }

    return ret;
  }

  function parse_while() {
    skip_kw("while");
    const cond = parse_expression();

    const body = parse_expression();
    const ret = {
      type: "while",
      cond,
      body
    }

    return ret
  }

  function parse_array() {
    skip_kw("Array");
    const data = delimited("[", "]", ",", parse_atom);
    return {
      type: "array",
      data
    }
  }

  function parse_getIndex(array) {
    skip_punc('[');
    const index = parse_atom();
    skip_punc(']');

    return {
      type: "getIndex",
      left: array,
      right: index
    }
  }

  function parse_method(tok) {
    skip_punc('.');

    return {
      type: "method",
      var: tok,
      method: parse_expression()
    }
  }

  function parse_lambda() {
    return {
      type: "lambda",
      vars: delimited("(", ")", ",", parse_varname),
      body: parse_expression()
    };
  }

  function parse_bool() {
    return {
      type: "bool",
      value: input.next().value == "true"
    };
  }

  function maybe_call(expr) {
    expr = expr();
    return is_punc("(") ? parse_call(expr) : expr;
  }

  function parse_atom() {
    return maybe_call(function(){
      if (is_punc("(")) {
        input.next();
        const exp = parse_expression();
        skip_punc(")");
        return exp;
      }
      if (is_punc("{")) return parse_prog();
      if (is_kw("if")) return parse_if();
      if (is_kw("while")) return parse_while();
      if (is_kw("Array")) return parse_array();
      if (is_kw("true") || is_kw("false")) return parse_bool();
      if (is_kw("lambda") || is_kw("function")) {
        input.next();
        return parse_lambda();
      }

      const tok = input.next();

      if (tok.type == "var") {
        if (is_punc("[")) return parse_getIndex(tok)
        if (is_punc(".")) return parse_method(tok)
        return tok;
      }
      if (tok.type == "num" || tok.type == "str" || tok.type == "method")
        return tok;

      unexpected();
    });
  }

  function parse_toplevel() {
    const prog = [];

    while (!input.eof()) {
      prog.push(parse_expression());
      if (!input.eof()) skip_punc(";");
    }
    return { type: "prog", prog: prog };
  }

  function parse_prog() {
    const prog = delimited("{", "}", ";", parse_expression);

    if (prog.length == 0) return FALSE;
    if (prog.length == 1) return prog[0];
    return { type: "prog", prog: prog };
  }

  function parse_expression() {
    return maybe_call(function(){
        return maybe_binary(parse_atom(), 0);
    });
  }

  return parse_toplevel();
}

module.exports = parse
