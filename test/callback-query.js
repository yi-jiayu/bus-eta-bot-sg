"use strict";

const handler = require('../src/main').handler;

const callback_query = {
  "update_id": 668444688, "callback_query": {
    "id": "432549314789401440", "from": {"id": 100710735, "first_name": "Jiayu", "username": "jiayu1"}, "message": {
      "message_id": 6,
      "from": {"id": 263767667, "first_name": "CalculusGame", "username": "CalculusGameBot"},
      "chat": {"id": 100710735, "first_name": "Jiayu", "username": "jiayu1", "type": "private"},
      "date": 1476437912,
      "text": "Etas for bus stop 96049\nSvc    Inc. Buses\n2         3    14    22\n24       15    27    35\n5        12    23    30",
      "entities": [{"type": "pre", "offset": 24, "length": 89}]
    }, "chat_instance": "-755686065470890988", "data": "{\"t\": \"eta\", \"d\":false, \"a\": \"81111 155\"}"
  }
};

handler(callback_query, null, function() {});
