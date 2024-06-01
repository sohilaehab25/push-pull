const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];

wss.on('connection', (ws) => {
    let username = null;

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.login) {
            username = data.username;
            clients.push({ ws, username });
            broadcast({ type: 'login', message: `${username} has joined the chat`, online: getOnlineUsers() });
        } else if (data.body) {
            broadcast({ type: 'chat', message: data.body, online: getOnlineUsers() });
        }
    });

    ws.on('close', () => {
        clients = clients.filter(client => client.ws !== ws);
        if (username) {
            broadcast({ type: 'logout', message: `${username} has left the chat`, online: getOnlineUsers() });
        }
    });

    ws.on('error', () => {
        clients = clients.filter(client => client.ws !== ws);
    });

    const broadcast = (data) => {
        clients.forEach(client => {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(JSON.stringify(data));
            }
        });
    };

    const getOnlineUsers = () => {
        return clients.map(client => client.username);
    };
});

app.use(express.static(path.join(__dirname, 'public')));

server.listen(8000, () => {
    console.log('Server is listening on port 8000');
});
