// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();

// our default array of dreams
// const dreams = [
//   "Find and count some sheep",
//   "Climb a really tall mountain",
//   "Wash the dishes"
// ];

const msgs = [
  {
    response_type: "in_channel",
    text: "채널 메시지1."
  },
  {
    response_type: "in_channel",
    text: "채널 메시지2."
  }
];

const wrap = str => {
  return { text: str };
};

const in_channel = msg => {
  return {
    response_type: "in_channel",
    text: msg
  };
};

// raw text msg -> json payload
var msg_unit = msg => {
  var unit = {
    text: msg,
    _add: msg => {
      unit.text += "" + msg;
      return unit;
    },
    _set: (k, v) => {
      unit[k] = v;
      return unit;
    },
    _end: () => {
      delete unit._set;
      delete unit._end;
      return JSON.stringify(unit);
    }
  };
  return unit;
};

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
// app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  // response.sendFile(__dirname + "/views/index.html");
  response.json(msgs[0]);
});

app.post("/", (req, res) => {
  // res.json(in_channel("POST request: " + req.get("Content-Type")));
  res.json(in_channel("POST request: " + JSON.stringify(req.body)));
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
