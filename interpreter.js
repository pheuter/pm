#!/usr/bin/env node

var puts = require("sys").puts;
var print = require("sys").print;
var fs = require("fs");
var parser = require("./parser").parser();

var stdin = process.openStdin();
stdin.setEncoding('utf8');

var stack = [];
var buffer = "";

var createWord = function (ast) {
  words[ast.word.value] = function(stack) {
    eval(ast.body);
  }
};
var createNumber = function (v) {
  return {
    type: "NUMBER",
    show: v,
    value: v
  }
};
var createBoolean = function (v) { // Runtime datatype, as opposed to other parse-time data types
  return {
    type: "BOOLEAN",
    show: v ? "t" : "f",
    value: v
  }
}

var eval = function (ast) { // Evaluate JSON AST
  ast.forEach(function (val) {
    if (val.type == "NUMBER") stack.push(val);
    if (val.type == "STRING") stack.push(val);
    if (val.type == "ARRAY") stack.push(val);
    if (val.type == "QUOTE") stack.push(val);
    if (val.type == "WORD") if (val.value == "t") stack.push(createBoolean(true)); else if (val.value == "f") stack.push(createBoolean(false)); else words[val.value](stack);
    if (val.type == "DEFINITION") createWord(val);
  });
}

if (process.argv[2]) { // File input
  fs.readFile(process.argv[2], function (err, data) {
    eval(parser.parse(data.toString()));
    puts("----------------Stack-------------------"); 
    stack.forEach(function (v) {puts(v.show);});
    puts("-----------------End-------------------");
    process.exit();
  });
} else { // Standard input
  stdin.on('data', function(data) {
    if (data.match(/\n/)) {
      var line = buffer + data.substr(0,data.indexOf("\n"));
      eval(parser.parse(line));
      puts("-----------------------------------"); 
      stack.forEach(function (v) {puts(v.show);});
      puts("-----------------------------------");
    } else buffer += data;
  });
}


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
  ".": function (stack) {
    puts(stack.pop().show);
  },
  "print": function (stack) {
    var val = stack.pop();
    print(val.show);
    stack.push(val);
  },
  "println": function (stack) {
    var val = stack.pop();
    puts(val.show);
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
  }
};