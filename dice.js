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

function diceAST(str) {
  var tokens = [];
  var re = /((\d)d(\d))|(\d)|([*/%])|([+-])|(floor|round|ceil|abs)|([(])|([)])/g;
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
      var t ={
        type: "diceLiteral",
        left: parseInt(diceL0, 10),
        right: parseInt(diceL1, 10)
      }
      tokens.push({...t,string: " " + t.left+"d"+t.right});
    }
    if (number) {
      var t = { type: "number", value: parseInt(number, 10) };
      tokens.push({...t,string: " " + t.value});
    }
    if (op1) {
      tokens.push({ type: "op1", string: op1 });
    }
    if (op2) {
      tokens.push({ type: "op2", string: op2 });
    }
    if (func) {
      tokens.push({ type: "func", string: func });
    }
    if (brac) {
      tokens.push({ type: "brac" });
    }
    if (ket) {
      tokens.push({ type: "ket" });
    }
    return "";
  });
  for (var i in tokens) {
    // TODO: AST construct
  }
  return tokens;
}

var testset = ["3", "2d6", "1+(2-3)*4/5%6", "1d3+2d4-3d6*4d8/5d3%6d10"];
function diceASTtest(tests) {
  for (let t of tests) {
    console.log(diceAST(t));
  }
}

// diceASTtest(testset);

console.log("./dice.js");
