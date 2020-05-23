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
    _add: more => {
      unit.text += "" + more;
      return unit;
    },
    _set: (k, v) => {
      unit[k] = v;
      return unit;
    },
    _end: () => {
      delete unit._set;
      delete unit._end;
      return unit;
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
  // res.json(in_channel("POST request: " + JSON.stringify(req.body)));
  res.json(
    msg_unit("POST request")
      ._set("response_type", "in_channel")
      ._add("\n" + "text: " + req.body.text)
      ._add("\n" + "token: " + req.body.token)
      ._add("\n" + "team_id: " + req.body.team_id)
      ._add("\n" + "team_domain: " + req.body.team_domain)
      ._add("\n" + "channel_id: " + req.body.channel_id)
      ._add("\n" + "channel_name: " + req.body.channel_name)
      ._add("\n" + "user_id: " + req.body.user_id)
      ._add("\n" + "user_name: " + req.body.user_name)
      ._add("\n" + "command: " + req.body.command)
      ._add("\n" + "text: " + req.body.text)
      ._add("\n" + "response_url: " + req.body.response_url)
      ._end()
  );
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
