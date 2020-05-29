// number = \d

// op1 = `*`
//   | `/`
//   | `%`

// op2 = `+`
//   | `-`

// func = `floor`
//   | `round`
//   | `ceil`
//   | `abs`

// diceLiteral = number`d`number

// diceExpr = func `(` diceExpr `)`
//   | `(` diceExpr `)`
//   | diceExpr op1 diceExpr
//   | diceExpr op2 diceExpr
//   | diceLiteral
//   | number

// input: string of diceExpr
// return: {tree:(AST of str), tokens:(tokenized str)}
function diceAST(str) {
  var tokens = [];
  var re = /((\d+) *d *(\d+))|(\d+)|([*/%])|([+-])|(floor|round|ceil|abs)|([(])|([)])/g;
  function node(type) {
    var t = {
      type: type
    };
    return t;
  }
  str.replace(re, function(
    match,
    diceL,
    diceL0,
    diceL1,
    number,
    op1,
    op2,
    func,
    brac,
    ket
  ) {
    if (diceL) {
      var t = node("diceLiteral");
      t = { ...t, left: parseInt(diceL0, 10), right: parseInt(diceL1, 10) };
      tokens.push({ ...t, string: ""+t.left + "d" + t.right });
    }
    if (number) {
      var t = node("number");
      t = { ...t, value: parseInt(number, 10) };
      tokens.push({ ...t});
    }
    if (op1) {
      var t = node("op1");
      tokens.push({ ...t, string: op1 });
    }
    if (op2) {
      var t = node("op2");
      tokens.push({ ...t, string: op2 });
    }
    if (func) {
      var t = node("func");
      tokens.push({ ...t, string: func });
    }
    if (brac) {
      tokens.push({ type: "brac" });
    }
    if (ket) {
      tokens.push({ type: "ket" });
    }
    return "";
  });
  function ast(list, start = 0, end = list.length) {
    var body = [];
    var rest;
    var err = [{ pos: start, body: body, hint: "error" }, end];
    var cur = start;
    var stack = [];
    while (cur < end) {
      switch (list[cur].type) {
        case "ket":
          return [stack, cur];
          break;
        case "func":
          if (list[cur + 1].type != "brac") {
            return err;
          }
          var [body, rest] = ast(list, cur + 2, end);
          if (list[rest].type != "ket") {
            return err;
          }
          stack.push({ pos: cur, body: body, hint: "function" });
          cur = rest + 1;
          continue;
        case "brac":
          var [body, rest] = ast(list, cur + 1, end);
          if (list[rest].type != "ket") {
            return err;
          }
          stack.push({ pos: cur, body: body, hint: "bracket" });
          cur = rest + 1;
          continue;
        case "diceLiteral":
        case "number":
          stack.push({ pos: cur, body: [], hint: list[cur].type });
          cur++;
          continue;
        case "op1": //*, /, %
          var left = stack.pop();
          var [body, rest] = ast(list, cur + 1, end);
          var right = body[0];
          var move = (...args) => {
            stack.push(...args);
          };
          var target;
          outter: while (1) {
            switch (right.hint) {
              case "op1":
              case "op2":
                // case "op3": for future
                move(right);
                target = right.body;
                right = right.body.shift();
                move = (...args) => {
                  target.unshift(...args);
                };
                continue;
              default:
                break outter;
            }
          }
          move({ pos: cur, body: [left, right], hint: list[cur].type });
          cur = rest;
          continue;
        case "op2": //+, -
          var left = stack.pop();
          var [body, rest] = ast(list, cur + 1, end);
          var right = body[0];
          var move = (...args) => {
            stack.push(...args);
          };
          var target;
          outter: while (1) {
            switch (right.hint) {
              case "op2":
                // case "op3": for future
                move(right);
                target = right.body;
                right = right.body.shift();
                move = (...args) => {
                  target.unshift(...args);
                };
                continue;
              default:
                break outter;
            }
          }
          move({ pos: cur, body: [left, right], hint: list[cur].type });
          cur = rest;
          continue;
        default:
          break;
      }
      cur++;
    }
    return [stack, cur];
  }
  return { tree: ast(tokens)[0], tokens: tokens };
}

function diceASTcompile(tree, tokens) {
  let list = [];
  let compiledNode = () => {
    return {
      body: [],
      rolled: false,
      result: null,
      string: "",
      roll: () => {},
      eval: () => {},
      stringify: () => {}
    };
  };
  for (const i in tree) {
    const t = compiledNode();
    t.body = diceASTcompile(tree[i].body, tokens);

    //t.roll
    switch (tree[i].hint) {
      case "function":
      case "bracket":
      case "op1":
      case "op2":
      case "number":
        t.roll = () => {
          t.body.map(v => v.roll());
          t.rolled = true;
        };
        break;
      case "diceLiteral":
        let token = tokens[tree[i].pos]
        let {left:left,right:right} = token
        t.roll = () => {
          t.body.map(v => v.roll());
          t.diceResult = [];
          for(;left>0;left--){
            t.diceResult.push(Math.floor(Math.random()*right+1))
          }
          t.rolled = true;
        };
        break;
      default:
        break;
    }
    //t.eval
    switch (tree[i].hint) {
      case "function":
        t.eval = () => {
          t.body.map(v => {
            v.eval();
          });
          if (t.body.every(v => v.rolled)) {
            var v = t.body[0].result;
            var name = tokens[tree[i].pos].string;
            v = {
              floor: Math.floor,
              round: Math.round,
              ceil: Math.ceil,
              abs: Math.abs
            }[name](v);
            t.result = v;
          }
          return t.result;
        };
        break;
      case "bracket":
        t.eval = () => {
          t.body.map(v => {
            v.eval();
          });
          t.result = t.body[0].result;
          return t.result;
        };
        break;
      case "op1":
        t.eval = () => {
          t.body.map(v => {
            v.eval();
          });
          if (t.body.every(v => v.rolled)) {
            let name = tokens[tree[i].pos].string;
            let [a, b] = t.body.map(v => v.result);
            let v = {
              "*": (a, b) => a * b,
              "/": (a, b) => a / b,
              "%": (a, b) => a % b
            }[name](a, b);
            t.result = v;
          }
          return t.result;
        };
        break;
      case "op2":
        t.eval = () => {
          t.body.map(v => {
            v.eval();
          });
          if (t.body.every(v => v.rolled)) {
            let name = tokens[tree[i].pos].string;
            let [a, b] = t.body.map(v => v.result);
            let v = {
              "+": (a, b) => a + b,
              "-": (a, b) => a - b
            }[name](a, b);
            t.result = v;
          }
          return t.result;
        };
        break;
      case "number":
        t.eval = () => {
          t.result = tokens[tree[i].pos].value;
          return t.result;
        };
        break;
      case "diceLiteral":
        t.eval = () => {
          if (t.rolled) {
            t.result = t.diceResult.reduce((acc, cur) => acc + cur, 0);
          }
          return t.result;
        };
        break;
      default:
        break;
    }
    //t.stringify
    switch (tree[i].hint) {
      case "function":
        const name = tokens[tree[i].pos].string;
        t.stringify = () => {
          let bodyStr = t.body.map(v => v.stringify());
          t.string = name + "(" + bodyStr.join("") + ")";
          return t.string;
        };
        break;
      case "bracket":
        t.stringify = () => {
          let bodyStr = t.body.map(v => v.stringify());
          t.string = "(" + bodyStr.join("") + ")";
          return t.string;
        };
        break;
      case "op1":
      case "op2":
        const op = tokens[tree[i].pos].string;
        t.stringify = () => {
          let bodyStr = t.body.map(v => v.stringify());
          t.string = bodyStr.join(op);
          return t.string;
        };
        break;
      case "number":
        const v = tokens[tree[i].pos].value;
        t.stringify = () => {
          t.string = "" + v;
          return t.string;
        };
        break;
      case "diceLiteral":
        const d = tokens[tree[i].pos].string;
        t.stringify = () => {
          if (t.rolled) {
            t.string = "(" + t.diceResult.join("+") + ")";
          } else {
            t.string = d;
          }
          return t.string;
        };
        break;
      default:
        break;
    }

    list.push(t);
  }
  return list;
}

function diceASTtest(cases) {
  for (let c of cases) {
    let ast = diceAST(c.input);
    let com = diceASTcompile(ast.tree, ast.tokens);
    let [x, , y, z] = [
      com[0].stringify(),
      com[0].roll(),
      com[0].eval(),
      com[0].stringify()
    ];
    c.output = [x, y, z];

    c.tests = [
      !c.expect[0].every(x => c.output[0].search(x) < 0),
      !c.expect[1].every(x => c.output[1] != x),
      !c.expect[2].every(x => c.output[2].search(x) < 0)
    ];
    c.pass = c.tests.every(x => x);
  }
  return cases;
}

let cases = [
  { input: "3d3", expect: [["3d3"], [3,4,5,6,7,8,9], [/^\([123]\+[123]\+[123]\)$/]] },
  { input: "  floor ( 3  d  3 %  3 / 2)   ", expect: [[/floor\(3d3%3\/2\)/], [0,0.5,1], [/^floor\(\([123]\+[123]\+[123]\)\%3\/2\)$/]] },
  { input: "1-   2 +3", expect: [[/1-2\+3/], [2], [/1-2\+3/]] },
  { input: "1-2 +3  *  5/ 4%  3", expect: [[/1-2\+3\*5\/4\%3/], [-0.25], [/1-2\+3\*5\/4\%3/]] },
];

console.log(diceASTtest(cases));
console.log(cases.map(x=>x.pass));

exports.diceAST = diceAST;
exports.diceASTcompile = diceASTcompile;

console.log("./dice.js");
