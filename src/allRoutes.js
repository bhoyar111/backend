import authroute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";

export default function (express) {
  let router = express.Router();

  authroute(router);
  userRoute(router);

  return router;
}
