import express, { json } from "express";
import cors from "cors";
import { readdirSync } from "fs";
import { log } from "./bot";
const app = express();
app.use(cors());
app.use(json());
app.use(async (err, req, res, next) => {
  try {
    await next();
  } catch (err) {
    log.error("server: ", err);
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
