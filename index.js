import express from "express"
import cors from "cors"

const app = express();
app.use(cors());
app.use(express.json())

const participant = {};
const messagens = [];

app.post("/", (req, res) => {
    const user = req.body;
    participant.name = user.name;
    participant.lastStatus = Date.now();
    console.log(participant);
    user.name === "" ? res.status(400).send("Sorry, you have to type your pretty name") : res.status(200).send();
})

app.listen(4000);