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

const test_payload = {
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "You have a new request:\n*<fakeLink.toEmployeeProfile.com|Fred Enriquez - New device request>*"
      }
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: "*Type:*\nComputer (laptop)"
        },
        {
          type: "mrkdwn",
          text: "*When:*\nSubmitted Aut 10"
        },
        {
          type: "mrkdwn",
          text: "*Last Update:*\nMar 10, 2015 (3 years, 5 months)"
        },
        {
          type: "mrkdwn",
          text: "*Reason:*\nAll vowel keys aren't working."
        },
        {
          type: "mrkdwn",
          text: '*Specs:*\n"Cheetah Pro 15" - Fast, really fast"'
        }
      ]
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            emoji: true,
            text: "Approve"
          },
          style: "primary",
          value: "click_me_123"
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            emoji: true,
            text: "Deny"
          },
          style: "danger",
          value: "click_me_123"
        }
      ]
    }
  ]
};

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
// keep all function returns "unit"
// ㄴthis will make "unit" uncanged its form during function call
function msg_unit(msg = "") {
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
    _next: (f, ...args) => {
      f(unit, ...args);
      return unit;
    },
    _end: () => {
      // delete unit._add;
      // delete unit._set;
      // delete unit._next;
      // delete unit._end;
      return unit;
    }
  };
  return unit;
}

// suger: map
const map = (obj, f) => {
  Object.entries(obj).map(f);
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

// DONE: if req.body.text start with "debug " -> send beautified req.body
app.post("/slack", (req, res) => {
  if (req.body.token !== process.env.SLACK_TOKEN) {
    return;
  }
  // res.json(in_channel("POST request: " + req.get("Content-Type")));
  if (req.body.text.startsWith("debug")) {
    res.json(
      msg_unit("POST request")
        ._set("response_type", "in_channel")
        ._next(unit => {
          map(req.body, ([k, v]) => {
            unit._add("\n" + k + ": " + v);
          });
        })
        // ._add("\n" + "token: " + req.body.token)
        // ._add("\n" + "team_id: " + req.body.team_id)
        // ._add("\n" + "team_domain: " + req.body.team_domain)
        // ._add("\n" + "channel_id: " + req.body.channel_id)
        // ._add("\n" + "channel_name: " + req.body.channel_name)
        // ._add("\n" + "user_id: " + req.body.user_id)
        // ._add("\n" + "user_name: " + req.body.user_name)
        // ._add("\n" + "command: " + req.body.command)
        // ._add("\n" + "text: " + req.body.text)
        // ._add("\n" + "response_url: " + req.body.response_url)
        ._end()
    );
  } else if (req.body.text.startsWith("roll")) {
    let re = /roll +(.*)/;
    let result;
    req.body.text.replace(re, function(match, query) {
      result = diceQuery(query);
    });
    res.json(
      msg_unit("POST request")
        ._set("response_type", "in_channel")
        ._add("\n" + result)
        ._end()
    );
  } else if (req.body.text.startsWith("test")) {
    res.json(
      Object.assign(
        msg_unit()
          ._set("response_type", "in_channel")
          ._end(),
        test_payload
      )
    );
  } else {
    res.json(
      msg_unit("POST request")
        ._set("response_type", "in_channel")
        ._add("\n" + "not supported")
        ._end()
    );
  }
});

const Dice = require("./dice.js");
// console.log(Dice);
function diceQuery(str) {
  try {
    let [roll, result, detail] = Dice.diceRoll(str);
    return ["roll: " + roll, "detail: " + detail, "result: " + result].join(
      "\n"
    );
  } catch {
    return "roll: error!";
  }
}

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
