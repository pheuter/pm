program
  = expr*

expr
  = definition
  / Number
  / String
  / Array
  / Quote
  / Word
  / (" " / "\n") { return {type: "WS"};}

definition
  = ":" " "* w:Word " "* e:effect " "* b:expr* ";" { return {type: "DEFINITION", word: w, effect: e, body: b};}

effect
  = "(" " "* t:([a-z] " "*)* "--" " "* g:([a-z] " "*)* ")" { return{take:t, give: g};}

Number
  = digits:("-"? [0-9]+ ("." [0-9]+)?) { return { type: "NUMBER", show: parseFloat(digits.join("").replace(/,/g,"")), value: parseFloat(digits.join("").replace(/,/g,"")) }; }

String
  = "\"" str:[^"\n]+ "\"" { return {type:"STRING", show: "\""+str.join("")+"\"",value:str.join("")}; }

Array
  = "{" items:(" "* (expr))* " "* "}" { var i = []; var s = []; items.forEach(function (v) {v.forEach(function (val) { if(val.type) { i.push(val.value); s.push(val.show);}});}); return {type:"ARRAY", show: "{"+s+"}",value:i};}

Quote
  = "[" e:expr* "]" { var s = []; e.forEach(function (v) {if(v.type) {s.push(v.show)}}); return {type: "QUOTE", show: "["+s.join(' ')+"]", value:e}; }

Word
  = t:([a-zA-Z] / "+" / "-" / "*" / "/" / "<" / ">" / "<=" / ">=" / "=" / ".")+ { return {type: "WORD", show: t.join(""),value: t.join('')};}