import express, { json } from "express";
import cors from "cors";
import { readdirSync } from "fs";
import { log } from "./bot";
import circular from "circular-json";
const app = express();
app.use(cors());
app.use(json());
app.use((req, res, next) => {
  try {
    next();
    if (!req.originalUrl?.includes("vote"))
      log.info("server: ", circular.stringify(req));
  } catch (err) {
    log.error("server: ", err, "\n", circular.stringify(req));
    res.status(500).send(err.message);
  }
});

for (const route of readdirSync("./src/server")) {
  if (route.includes(".")) {
    import(`./server/${route}`)
      .then(({ default: router }) => {
        app.use(`/${route.split(".")[0]}`, router);
      })
      .catch(console.error);

    continue;
  }
}
app.get("/", (_, res) => res.send("Hello, World!"));

export default app;

function simpleStringify(object) {
  var simpleObject = {};
  for (var prop in object) {
    if (!object.hasOwnProperty(prop)) {
      continue;
    }
    if (typeof object[prop] == "object") {
      continue;
    }
    if (typeof object[prop] == "function") {
      continue;
    }
    simpleObject[prop] = object[prop];
  }
  return JSON.stringify(simpleObject); // returns cleaned up JSON
}
