import express from "express"
import cors from "cors"
import dayjs from "dayjs"
import Joi from "joi";
import { stripHtml } from "string-strip-html";

const app = express();
app.use(cors());
app.use(express.json())

const participants = [{name: "L"}];
const messages = [];

app.post("/participants", (req, res) => {
    let user = req.body;
    const userValidation = Joi.object({
        name: Joi.string()
            .required()
            .min(1)
            .trim()
    })

    if (!userValidation.validate(user).error){
        user.lastStatus = Date.now();
        participants.push(user);
        messages.push({
            from: stripHtml(user.name).result.trim(),
            to: "Todos",
            text: "entered the room...",
            type: "status",
            time: dayjs(user.lastStatus).format("HH:MM:ss") 
        });
        res.status(200).send();
    } else res.status(400).send("Sorry, you have to type your pretty name") 

})

app.get("/participants", (req, res) => {
    res.send(JSON.stringify(participants))
    
})

app.post("/messages", (req, res) => {
    const message = req.body;
    const verifiedMessage = {
        to: stripHtml(message.to).result.trim(),
        type: stripHtml(message.type).result.trim(),
        text: stripHtml(message.text).result.trim()
    }
    const sender = req.headers.user;
    console.log(verifiedMessage);

    const messageValidator = Joi.object({
        to: Joi.string()
            .required()
            .min(1)
            .trim(),
        text: Joi.string()
            .min(1)
            .required()
            .trim(),
        type: Joi.string()
            .required()
            .valid("message", "private_message")
            .trim()
    })

    const isParticipating = participants.some(p => p.name === sender);

    if(!messageValidator.validate(verifiedMessage).error && isParticipating){
        verifiedMessage.from = stripHtml(sender).result.trim();
        verifiedMessage.time = dayjs().format("HH:MM:ss");
        messages.push(verifiedMessage);
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
    const isParticipating = participants.some(p => p.name === user.trim());
    if(!isParticipating){
        res.status(400).send()
    } else {
        participants.forEach(p => {
            if(p.name === user.trim()){
                p.lastStatus = Date.now();
            }
        })
        res.status(200).send()
    }
})

setInterval(() => {
    participants.forEach((p,i) => {
        if((Date.now() - p.lastStatus) > 10000){
           participants.splice(i,1)
           messages.push({from: p.name, to: 'Todos', text: 'sai da sala...', type: 'status', time: dayjs(Date.now()).format('HH:MM:ss')}) 
        }    
    })
}, 15000)

app.listen(4000);