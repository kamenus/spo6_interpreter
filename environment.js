function Environment(parent) {
  this.vars = Object.create(parent ? parent.vars : null);
  this.parent = parent;
}

Environment.prototype = {
  extend: function() {
    return new Environment(this);
  },
  lookup: function(name) {
    let scope = this;
    while (scope) {
      if (Object.prototype.hasOwnProperty.call(scope.vars, name))
        return scope;
      scope = scope.parent;
    }
  },
  get: function(name) {
    if (name in this.vars)
      return this.vars[name];
    throw new Error("Undefined variable " + name);
  },
  set: function(name, value) {
    const scope = this.lookup(name);
    if (!scope && this.parent)
      throw new Error("Undefined variable " + name);
    return (scope || this).vars[name] = value;
  },
  def: function(name, value) {
    return this.vars[name] = value;
  }
};

const globalEnv = new Environment()

// Assign predefined methods
globalEnv.def("println", function(val){
  console.log(val);
});
globalEnv.def("print", function(val){
  console.log(val);
});


module.exports = {
  globalEnv,
  Environment
}

// if (typeof process != "undefined") (function(){
// if (typeof process != "undefined") (function(){
//   var code = "";
//   process.stdin.setEncoding("utf8");
//   process.stdin.on("readable", function(){
//     var chunk = process.stdin.read();
//     if (chunk) code += chunk;
//   });
//   process.stdin.on("end", function(){
//       var ast = parse(TokenStream(InputStream(code)));
//       evaluate(ast, globalEnv);
//   });
// })();
