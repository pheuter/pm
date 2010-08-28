var stack = [];

var createWord = function (ast) {
  words[ast.word.value] = function(stack) {
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

var eval = function (ast) { // Evaluate JSON AST
  ast.forEach(function (val) {
    if (val.type == "NUMBER") stack.push(val);
    if (val.type == "STRING") stack.push(val);
    if (val.type == "ARRAY") stack.push(val);
    if (val.type == "QUOTE") stack.push(val);
    if (val.type == "WORD") if (val.value == "t") stack.push(createBoolean(true)); else if (val.value == "f") stack.push(createBoolean(false)); else words[val.value](stack);
    if (val.type == "DEFINITION") createWord(val);
  });
};

var run = function(ast) {
  eval(ast);
  stack.forEach(function (v) { 
    $("<p style=\"padding:0px;\">"+v.show+"</p>").appendTo("#stack"); 
  });
};

// -------------------------------- Core Library -------------------------------- \\

words = {
  "+": function (stack) {
    operands = []
    operands.push(stack.pop());
    operands.push(stack.pop());
    stack.push(createNumber(operands[1].value + operands[0].value)); 
  },
  "-": function (stack) {
    operands = []
    operands.push(stack.pop());
    operands.push(stack.pop());
    stack.push(createNumber(operands[1].value - operands[0].value)); 
  },
  "*": function (stack) {
    operands = []
    operands.push(stack.pop());
    operands.push(stack.pop());
    stack.push(createNumber(operands[1].value * operands[0].value)); 
  },
  "/": function (stack) {
    operands = []
    operands.push(stack.pop());
    operands.push(stack.pop());
    stack.push(createNumber(operands[1].value / operands[0].value)); 
  },
  "^": function (stack) {
    operands = []
    operands.push(stack.pop());
    operands.push(stack.pop());
    stack.push(createNumber(Math.pow(operands[1].value,operands[0].value)))
  },
  ".": function (stack) {
    $("<p>"+stack.pop().show+"</p>").appendTo("#stdout");
  },
  "print": function (stack) {
    var val = stack.pop();
    $("<p>"+val.show+"</p>").appendTo("#stdout");
    stack.push(val);
  },
  "println": function (stack) {
    var val = stack.pop();
    $("<p>"+val.show+"</p>").appendTo("#stdout");
    stack.push(val);
  },
  "dup": function (stack) {
    var val = stack.pop();
    stack.push(val);
    stack.push(val);
  },
  "drop": function (stack) {
    stack.pop();
  },
  "nip": function (stack) {
    stack.splice(stack.length-2,1);
  },
  "over": function (stack) {
    stack.push(stack[stack.length-2]);
  },
  "swap": function (stack) {
    var top = stack[stack.length-1];
    stack[stack.length-1] = stack[stack.length-2];
    stack[stack.length-2] = top;
  },
  "call": function (stack) {
    var quote = stack.pop();
    eval(quote.value);
  },
  "and": function (stack) {
    var operands = [];
    operands.push(stack.pop());
    operands.push(stack.pop());
    operands[1].value && operands[0].value ? stack.push(createBoolean(true)) : stack.push(createBoolean(false));
  },
  "or": function (stack) {
    var operands = [];
    operands.push(stack.pop());
    operands.push(stack.pop());
    operands[1].value || operands[0].value ? stack.push(createBoolean(true)) : stack.push(createBoolean(false));
  },
  "=": function (stack) {
    var operands = [];
    operands.push(stack.pop());
    operands.push(stack.pop());
    operands[1].value == operands[0].value ? stack.push(createBoolean(true)) : stack.push(createBoolean(false));
  },
  "<": function (stack) {
    var operands = [];
    operands.push(stack.pop());
    operands.push(stack.pop());
    operands[1].value < operands[0].value ? stack.push(createBoolean(true)) : stack.push(createBoolean(false));
  },
  ">": function (stack) {
    var operands = [];
    operands.push(stack.pop());
    operands.push(stack.pop());
    operands[1].value > operands[0].value ? stack.push(createBoolean(true)) : stack.push(createBoolean(false));
  },
  "<=": function (stack) {
    var operands = [];
    operands.push(stack.pop());
    operands.push(stack.pop());
    operands[1].value <= operands[0].value ? stack.push(createBoolean(true)) : stack.push(createBoolean(false));
  },
  ">=": function (stack) {
    var operands = [];
    operands.push(stack.pop());
    operands.push(stack.pop());
    operands[1].value >= operands[0].value ? stack.push(createBoolean(true)) : stack.push(createBoolean(false));
  },
  "if": function (stack) {
    var f = stack.pop();
    var t = stack.pop();
    var cond = stack.pop();
    cond.value ? eval(t.value) : eval(f.value);
  },
  "length": function (stack) {
    var item = stack.pop();
    stack.push(createNumber(item.value.length));
  },
  "range": function (stack) {
    var to = stack.pop().value;
    var from = stack.pop().value;
    var array = [];
    if (to > from) for(var i = from; i <= to; i++) array.push(i);
    else for(var i = from; i >= to; i--) array.push(i);
    stack.push(createArray(array));
  },
  "each": function (stack) {
    var quote = stack.pop();
    var array = stack.pop();
    array.value.forEach(function (v) {
      stack.push({type: v.type, show: v.show, value: v.value});
      eval(quote.value);
    });
  },
  "map": function (stack) {
    var quote = stack.pop();
    var array = stack.pop();
    var aux = [];
    array.value.forEach(function (v) {
      stack.push({type: v.type, show: v.show, value: v.value});
      eval(quote.value);
      aux.push(stack.pop().value);
    });
    stack.push(createArray(aux));
  },
  "reverse": function (stack) {
    var val = stack.pop()
    if (val.type == "ARRAY") {
      var items = []; 
      val.value.forEach(function(v) {
        items.push(v.value)
      }); 
      stack.push(createArray(items.reverse()));
    }
    else if (val.type == "STRING") stack.push(createString(val.value.split('').reverse().join('')));
  }
};