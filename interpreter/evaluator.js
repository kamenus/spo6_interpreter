function evaluate(exp, env) {
  switch (exp.type) {
    case "num":
    case "str":
    case "bool":
      return exp.value;

    case "array":
      return exp.data.map(el => evaluate(el))

    case "var":
      return env.get(exp.value);

    case "assign": {
      if (exp.left.type === "getIndex") {
        const [array, index, value] = set_index(env, exp.left);
        return env.setProperty(array, index, evaluate(exp.right, env))
      } else {
        return env.set(exp.left.value, evaluate(exp.right, env));
      }
    }

    case "binary":
      return apply_op(exp.operator, evaluate(exp.left, env), evaluate(exp.right, env));

    case "lambda":
      return make_lambda(env, exp);

    case "getIndex":
      return get_index(env, exp);

    case "if": {
      const cond = evaluate(exp.cond, env);
      if (cond !== false) return evaluate(exp.then, env);
      return exp.else ? evaluate(exp.else, env) : false;
    }

    case "while": {
      const cond = evaluate(exp.cond, env);
      if (cond) {
        evaluate(exp.body, env);
        return evaluate(exp, env);
      } else {
        return false
      }
    }
    case "prog":
      let val = false;
      exp.prog.forEach(function(exp){ val = evaluate(exp, env) });
      return val;

    case "call":
      const func = evaluate(exp.func, env);
      return func.apply(null, exp.args.map(function(arg){
        return evaluate(arg, env);
      }));

    default:
      throw new Error("I don't know how to evaluate " + exp.type);
  }
}

function apply_op(op, a, b) {
  function num(x) {
    if (typeof x != "number")
      throw new Error("Expected number but got " + x);
    return x;
  }

  function div(x) {
    if (num(x) == 0)
      throw new Error("Divide by zero");
    return x;
  }

  switch (op) {
    case "+": return num(a) + num(b);
    case "-": return num(a) - num(b);
    case "*": return num(a) * num(b);
    case "/": return num(a) / div(b);
    case "%": return num(a) % div(b);
    case "&&": return a !== false && b;
    case "||": return a !== false ? a : b;
    case "<": return num(a) < num(b);
    case ">": return num(a) > num(b);
    case "<=": return num(a) <= num(b);
    case ">=": return num(a) >= num(b);
    case "==": return a === b;
    case "!=": return a !== b;
  }

  throw new Error("Can't apply operator " + op);
}

function get_index(env, exp) {
  const from = evaluate(exp.left, env);
  const index = evaluate(exp.right, env);

  try {
    return from[index]
  } catch (e) {
    throw new Error("Can't get index: " + index + ' from array ', from);
  }
}

function set_index(env, exp) {
  const from = exp.left.value;
  const index = evaluate(exp.right, env);

  try {
    let value = evaluate(exp.left, env)[index];
    return [from, index, value]
  } catch (e) {
    throw new Error("Can't get index: " + index + ' from array ', from);
  }
}

function make_lambda(env, exp) {
  function lambda() {
    const names = exp.vars;
    const scope = env.extend();
    for (let i = 0; i < names.length; ++i) {
      scope.def(names[i], i < arguments.length ? arguments[i] : false);
    }

    return evaluate(exp.body, scope);
  }

  return lambda;
}

module.exports = evaluate
