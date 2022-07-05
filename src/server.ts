import express, { json } from "express";
import cors from "cors";
import { readdirSync } from "fs";
const app = express();
app.use(cors());
app.use(json());

for (const route of readdirSync("./src/server")) {
  if (route.includes(".")) {
    import(`./server/${route}`).then(({ default: router }) => {
      app.use(`/${route.split(".")[0]}`, router);
    });
    continue;
  }
  // import directory
  for (const routeInside of readdirSync(`./src/server/${route}`)) {
    import(`./server/${route}/${routeInside}`)
      .then(({ default: router }) => {
        app.use(`/${route}/${routeInside.split(".")[0]}`, router);
      })
      .catch(console.error);
  }
}
app.get("/", (_, res) => res.send("Hello, World!"));

export default app;
