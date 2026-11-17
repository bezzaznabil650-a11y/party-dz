
const express = require("express");
const { AccessToken } = require("livekit-server-sdk");

const app = express();

// السماح لموقع Party Dz بالاتصال بالخادم
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
  res.send("Party Dz Voice Server is running!");
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
        error: "Missing or invalid room or participant name"
      });
    }

    if (
      !process.env.LIVEKIT_API_KEY ||
      !process.env.LIVEKIT_API_SECRET
    ) {
      return res.status(500).json({
        error: "LiveKit credentials are not configured"
      });
    }

    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { identity: participantName.trim() }
    );

    token.addGrant({
      roomJoin: true,
      room: roomName.trim(),
      canPublish: true,
      canSubscribe: true
    });

    const jwt = await token.toJwt();

    res.json({ token: jwt });

  } catch (error) {
    console.error("Token generation error:", error);

    res.status(500).json({
      error: "Could not create token"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Party Dz server running on port ${PORT}`);
});
