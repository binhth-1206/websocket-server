import express from "express";
import http from "http";
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { clearInterval } from "timers";
import { WebSocketServer } from "ws";

const app = express();

app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "2mb" }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server is ready");
});

app.get("/api/token", (req, res) => {
  return res.send(uuidv4());
});

app.post("/api/token", (req, res) => {
  return res.send(uuidv4());
});

const port = 6002;
const httpServer = http.Server(app);
const wss = new WebSocketServer({ port: 6969 });

httpServer.listen(port, () => {
  console.log(`Serve at http://localhost:${port}`);
});

let numberOfCardsRelease = 0;
let numberOfCardsReleaseSuccess = 0;

wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    let numberOfCardsReRelease = 0;
    let numberOfCardsReReleaseSuccess = 0;

    const { type, body } = JSON.parse(data);

    console.log("type is: ", type);

    const handleReleaseCard = (numberOfCards) => {
      const releaseInterval = setInterval(() => {
        if (numberOfCardsRelease === numberOfCardsReleaseSuccess) {
          numberOfCardsRelease = 0;
          numberOfCardsReleaseSuccess = 0;
          ws.send(
            JSON.stringify({
              type: "onDone",
              body: {
                message: "Done",
              },
            })
          );
          clearInterval(releaseInterval);
        }

        ws.send(
          JSON.stringify({
            type: "onRelease",
            body: {
              statusCode: 200,
              message: "Success",
            },
          })
        );

        numberOfCardsReleaseSuccess++;

        if (numberOfCardsReleaseSuccess === 3) {
          ws.send(
            JSON.stringify({
              type: "onError",
              body: {
                statusCode: 400,
                message: "Error",
              },
            })
          );
          clearInterval(releaseInterval);
        }
      }, 2000);
    };

    switch (type) {
      case "auth":
        break;
      case "release":
        const { numberOfCards } = body;
        numberOfCardsRelease = numberOfCards;

        handleReleaseCard(numberOfCardsRelease);

        break;
      case "reRelease":
        ws.send(JSON.stringify(""));
      case "continue":
        if (numberOfCardsRelease > numberOfCardsReleaseSuccess) {
          handleReleaseCard(numberOfCardsRelease - numberOfCardsReleaseSuccess);
        }
        break;
      case "done":
        numberOfCardsRelease = 0;
        numberOfCardsReleaseSuccess = 0;
        break;
      case "cancel":
        numberOfCardsRelease = 0;
        numberOfCardsReleaseSuccess = 0;
        break;
      default:
        break;
    }
  });
});
