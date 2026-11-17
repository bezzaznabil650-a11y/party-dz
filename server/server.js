
const express = require("express");
const { AccessToken } = require("livekit-server-sdk");

const app = express();

app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://bezzaznabil650-a11y.github.io"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Saher Live Voice Server is running!");
});

app.post("/get-token", async (req, res) => {
  try {
    const { roomName, participantName } = req.body || {};

    if (
      typeof roomName !== "string" ||
      typeof participantName !== "string" ||
      !roomName.trim() ||
      !participantName.trim()
    ) {
      return res.status(400).json({
        error: "Room name and participant name are required"
      });
    }

    if (
      !process.env.LIVEKIT_API_KEY ||
      !process.env.LIVEKIT_API_SECRET
    ) {
      return res.status(500).json({
        error: "LiveKit credentials are missing"
      });
    }

    const identity = participantName.trim().slice(0, 50);
    const room = roomName.trim().slice(0, 100);

    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { identity }
    );

    token.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true
    });

    res.json({
      token: await token.toJwt()
    });

  } catch (error) {
    console.error("LiveKit token error:", error);

    res.status(500).json({
      error: "Could not create voice token"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Saher Live server running on port " + PORT);
});
