import express from "express"
import cors from "cors"
import dayjs from "dayjs";

const app = express();
app.use(cors());
app.use(express.json())

const participants = [];
const messages = [];

app.post("/participants", (req, res) => {
    const user = req.body;
    const participant = {}
    if (user.name) {
        user.lastStatus = Date.now();
        participants.push(user);
        messages.push({
            from: participant.name,
            to: "Todos",
            text: "entered the room...",
            type: "status",
            time: dayjs(participant.lastStatus).format("HH:MM:ss") 
        });
        console.log(participants, messages);
        res.status(200).send();
    } 
    res.status(400).send("Sorry, you have to type your pretty name") 

})

app.get("/participants", (req, res) => {
    res.send(JSON.stringify(participants))
})

app.post("/messages", (req, res) => {
    const message = req.body;
    const sender = req.headers.user;
    console.log(req.headers.user);
    const isParticipating = participants.some(p => p.name === sender);
    if(message.to && message.text && (message.type === "private_message" || message.type === "message") && isParticipating){
        message.from = sender;
        message.time = dayjs().format("HH:MM:ss");
        messages.push(message);
        res.status(200).send();    
    } else res.status(400).send("this kind of message is not supported")
})

app.get("/messages", (req, res) => {
    const limit = Number(req.query.limit);
    const sendableMessages = messages.filter(m => Boolean((m.type !== "private_message") || (m.to === req.headers.user) || (m.from === req.headers.user))) 
    if(limit === NaN || sendableMessages.length < limit){
        res.send(JSON.stringify(sendableMessages))
    } else {
        res.send(JSON.stringify(sendableMessages.slice(sendableMessages.length - limit - 1, sendableMessages.length - 1)));
    }
})

app.post("/status", (req, res) => {
    const user = req.headers.user;
    const isParticipating = participants.some(p => p.name === user.name);
    if(!isParticipating){
        res.status(400).send()
    } else {
        participants.forEach(p => {
            if(p.name === user.name){
                p.lastStatus = Date.now();
            }
        })
        res.status(200).send()
    }
})

setInterval(() => {
    participants.forEach((p,i) => {
        if((Date.now() - p.lastStatus) > 10){
           participants.splice(i,1)
           messages.push({from: p.name, to: 'Todos', text: 'sai da sala...', type: 'status', time: dayjs(Date.now()).format('HH:MM:ss')}) 
        }    
    })
}, 15000)

app.listen(4000);