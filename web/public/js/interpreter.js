var stack = [];

var createWord = function (ast) {
  words[ast.word.value] = function() {
    eval(ast.body);
  }
};
var createArray = function (v) {
  return parser.parse("{"+v.join(" ")+"}")[0];
};
var createString = function (v) {
  return parser.parse("\""+v+"\"")[0];
};
var createNumber = function (v) {
  return parser.parse(v+"")[0];
};
var createBoolean = function (v) { // Runtime datatype, as opposed to other parse-time data types
  return {
    type: "BOOLEAN",
    show: v ? "t" : "f",
    value: v
  }
};
var pusher = function (v) {
  if (typeof(v) == "number") stack.push(createNumber(v));
  else if (typeof(v) == "string") stack.push(createString(v));
  else if (typeof(v) == "boolean") stack.push(createBoolean(v));
  else if (v.constructor.toString().indexOf("Array") != -1) stack.push(createArray(v));
  else stack.push(v);
};

var eval = function (ast) { // Evaluate JSON AST
  ast.forEach(function (val) {
    if (val.type == "NUMBER") stack.push(val);
    if (val.type == "STRING") stack.push(val);
    if (val.type == "ARRAY") stack.push(val);
    if (val.type == "QUOTE") stack.push(val);
    try {
      if (val.type == "WORD") if (val.value == "t") stack.push(createBoolean(true)); else if (val.value == "f") stack.push(createBoolean(false)); else words[val.value]();
    } catch(error) {
      throw {name : "PMError", message : val.value+" not defined (or incorrect stack params)! Try ( : "+val.value+" | <body> ; )"};
    }
    if (val.type == "DEFINITION") createWord(val);
  });
};

var run = function(ast) {
  eval(ast);
  var output = [];
  stack.forEach(function (v) { 
    output.push(v.show);
  });
  return output.join('\n');
};

// -------------------------------- Core Library -------------------------------- \\

words = {
  "+": function () {
    operands = []
    operands.push(stack.pop());
    operands.push(stack.pop());
    pusher(operands[1].value + operands[0].value); 
  },
  "-": function () {
    operands = []
    operands.push(stack.pop());
    operands.push(stack.pop());
    pusher(operands[1].value - operands[0].value); 
  },
  "*": function () {
    operands = []
    operands.push(stack.pop());
    operands.push(stack.pop());
    pusher(operands[1].value * operands[0].value); 
  },
  "/": function () {
    operands = []
    operands.push(stack.pop());
    operands.push(stack.pop());
    pusher(operands[1].value / operands[0].value); 
  },
  "^": function () {
    operands = []
    operands.push(stack.pop());
    operands.push(stack.pop());
    pusher(Math.pow(operands[1].value,operands[0].value));
  },
  ".": function () {
    alert(stack.pop().show);
  },
  "print": function () {
    var val = stack.pop();
    alert(val.show);
    pusher(val);
  },
  "println": function () {
    var val = stack.pop();
    alert(val.show+"\n");
    pusher(val);
  },
  "dup": function () {
    var val = stack.pop();
    pusher(val);
    pusher(val);
  },
  "drop": function () {
    stack.pop();
  },
  "nip": function () {
    stack.splice(stack.length-2,1);
  },
  "over": function () {
    pusher(stack[stack.length-2]);
  },
  "swap": function () {
    var top = stack[stack.length-1];
    stack[stack.length-1] = stack[stack.length-2];
    stack[stack.length-2] = top;
  },
  "call": function () {
    var quote = stack.pop();
    eval(quote.value);
  },
  "and": function () {
    var operands = [];
    operands.push(stack.pop());
    operands.push(stack.pop());
    operands[1].value && operands[0].value ? pusher(true) : pusher(false);
  },
  "or": function () {
    var operands = [];
    operands.push(stack.pop());
    operands.push(stack.pop());
    operands[1].value || operands[0].value ? pusher(true) : pusher(false);
  },
  "=": function () {
    var operands = [];
    operands.push(stack.pop());
    operands.push(stack.pop());
    operands[1].value == operands[0].value ? pusher(true) : pusher(false);
  },
  "<": function () {
    var operands = [];
    operands.push(stack.pop());
    operands.push(stack.pop());
    operands[1].value < operands[0].value ? pusher(true) : pusher(false);
  },
  ">": function () {
    var operands = [];
    operands.push(stack.pop());
    operands.push(stack.pop());
    operands[1].value > operands[0].value ? pusher(true) : pusher(false);
  },
  "<=": function () {
    var operands = [];
    operands.push(stack.pop());
    operands.push(stack.pop());
    operands[1].value <= operands[0].value ? pusher(true) : pusher(false);
  },
  ">=": function () {
    var operands = [];
    operands.push(stack.pop());
    operands.push(stack.pop());
    operands[1].value >= operands[0].value ? pusher(true) : pusher(false);
  },
  "if": function () {
    var f = stack.pop();
    var t = stack.pop();
    var cond = stack.pop();
    cond.value ? eval(t.value) : eval(f.value);
  },
  "length": function () {
    var item = stack.pop();
    pusher(item.value.length);
  },
  "range": function () {
    var to = stack.pop().value;
    var from = stack.pop().value;
    var array = [];
    if (to > from) for(var i = from; i <= to; i++) array.push(i);
    else for(var i = from; i >= to; i--) array.push(i);
    pusher(array);
  },
  "each": function () {
    var quote = stack.pop();
    var array = stack.pop();
    array.value.forEach(function (v) {
      pusher({type: v.type, show: v.show, value: v.value});
      eval(quote.value);
    });
  },
  "map": function () {
    var quote = stack.pop();
    var array = stack.pop();
    var aux = [];
    array.value.forEach(function (v) {
      pusher({type: v.type, show: v.show, value: v.value});
      eval(quote.value);
      aux.push(stack.pop().value);
    });
    pusher(aux);
  },
  "reduce": function () {
    var quote = stack.pop();
    var init = stack.pop();
    var array = stack.pop();
    pusher(init.value);
    array.value.forEach(function (v) {
      pusher(v.value);
      eval(quote.value);
    });
  },
  "reverse": function () {
    var val = stack.pop()
    if (val.type == "ARRAY") {
      var items = []; 
      val.value.forEach(function(v) {
        items.push(v.value)
      }); 
      pusher(items.reverse());
    }
    else if (val.type == "STRING") pusher(val.value.split('').reverse().join(''));
  }
};