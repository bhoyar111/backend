import http from "http";
import { get } from "./config/Config.js";
import app from "./app.js";
import { log } from "console";

const env = process.env.NODE_ENV || "development";

const config = get(env);
const port = config.PORT;

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Auth Server is running--ENV:${env}--Port:${port}`);
});
