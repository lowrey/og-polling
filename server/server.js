const express = require('express');
const http = require('http');
const cors = require('cors');

const port = process.env.PORT || 3090;
const app = express();
const server = http.createServer(app);
app.use(cors());

app.get('/*', (req, res) => {
    res.send('og-polling server');
});

let polls = {};
let activePolls = {};

const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
});
const pollHandlers = (socket) => ({
    get: () => {
        const { query } = socket.handshake;
        io.in(query.roomId).emit('polls', polls);
    },
    getActive: () => {
        const { query } = socket.handshake;
        io.in(query.roomId).emit('activePolls', activePolls);
    },
    vote: ({ pollName, username, value }) => {
        const { query, address } = socket.handshake;
        const ballot = {
            pollName,
            username,
            address,
            value,
            timestamp: Date.now()
        };
        if (!polls[pollName]) {
            polls[pollName] = [ballot];
        } else {
            polls[pollName].push(ballot);
        }
        io.in(query.roomId).emit('polls', polls);
    },
    makeActive: ({ pollName, isActive }) => {
        const { query } = socket.handshake;
        activePolls[pollName] = isActive;
        io.in(query.roomId).emit('activePolls', activePolls);
    },
    reset: () => {
        const { query } = socket.handshake;
        polls = {};
        activePolls = {};
        io.in(query.roomId).emit('polls', polls);
        io.in(query.roomId).emit('activePolls', activePolls);
    }
});
io.on('connection', (socket) => {
    const { roomId } = socket.handshake.query;
    socket.roomId = roomId;
    socket.join(roomId);

    const handlers = pollHandlers(socket);
    socket.on('polls:get', handlers.get);
    socket.on('polls:vote', handlers.vote);
    socket.on('polls:reset', handlers.reset);
    socket.on('activePolls:makeActive', handlers.makeActive);
    socket.on('activePolls:get', handlers.getActive);

    socket.on('disconnect', () => {
        socket.leave(roomId);
    });
});

server.listen(port);
console.log('This express app is listening on port:' + port);
