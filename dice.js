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
  var re = /((\d)+d(\d)+)|(\d)+|([*/%])|([+-])|(floor|round|ceil|abs)|([(])|([)])/g;
  function node(type) {
    var t = {
      type: type,
      rolled: false,
      result: [],
      roll: () => {
        t.rolled = true;
        return t;
      },
      eval: () => {
        return t;
      }
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
      //TODO: make proper roll
      t.roll = () => {
        t.rolled = true;
        t.result = [0, 0, 0];
        t.string = "(" + t.result.join("+") + ")";
        return t;
      };
      t.eval = () => {
        return t.result.reduce((acc, cur) => {
          return acc + cur;
        }, 0);
      };
      tokens.push({ ...t, string: " " + t.left + "d" + t.right });
    }
    if (number) {
      var t = node("number");
      t = { ...t, value: parseInt(number, 10) };
      t.eval = () => {
        return t.value;
      };
      tokens.push({ ...t, string: " " + t.value });
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
          var move = (...args)=>{stack.push(...args)};
          var target
          outter: while (1) {
            switch (right.hint) {
              case "op2":
              // case "op3": for future
                move(right);
                target = right.body
                right = right.body.shift()
                move = (...args)=>{target.unshift(...args)};
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
          stack.push({ pos: cur, body: [left, right], hint: list[cur].type });
          cur = rest;
          continue;
        default:
          break;
      }
      cur++;
    }
    return [stack, cur];
  }
  return {tree:ast(tokens)[0], tokens:tokens};
}

var testset = ["3", "2d6", "1+(2-3)*4/5%6", "1d3+2d4-3d6*4d8/5d3%6d10"];
function diceASTtest(tests) {
  for (let t of tests) {
    console.log(diceAST(t));
  }
}

diceASTtest(testset);

console.log("./dice.js");
exports.diceAST = diceAST;
