import express from "express";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
import fileUpload from 'express-fileupload';

import "./config/Database.js";
import routes from "./src/allRoutes.js";
import decryptResponse from "./src/decryptResponse.js";
import { ensureAuthorized } from "./src/middleware/ensureAuthorized.js";

const app = express();
app.use(fileUpload());
app.use(bodyParser.json({ limit: "50MB" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({ origin: "*" }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.get("/", (req, res) => {
  res.send("Auth is running");
});

app.post("/view-decrypt-res", decryptResponse.viewDecryptRes);
app.use("/auth", routes(express));
app.use(ensureAuthorized);

// Example protected route
app.get("/protected", (req, res) => {
  res.send("Protected route is working!");
});

// Not found
app.use((req, res) => {
  res.status(404).send("Not Found");
});

export default app;
