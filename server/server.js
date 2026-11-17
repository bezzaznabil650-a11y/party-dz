const express = require("express");
const { AccessToken } = require("livekit-server-sdk");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Party Dz Voice Server is running!");
});

app.post("/get-token", async (req, res) => {
  try {
    const { roomName, participantName } = req.body;

    if (!roomName || !participantName) {
      return res.status(400).json({ error: "Missing room or participant name" });
    }

    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { identity: participantName }
    );

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true
    });

    res.json({ token: await token.toJwt() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create token" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Party Dz server running on port ${PORT}`);
});
