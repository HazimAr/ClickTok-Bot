import express, { json } from "express";
import cors from "cors";
import { readdirSync } from "fs";
const app = express();
app.use(cors());
app.use(json());

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
