import express from "express"

const app = express();
app.use(cors());

const participant = {};
const messagens = [];

app.post("/login", (req, res) => {
    console.log(req.body);
    res.send({})
})

app.listen(4000);