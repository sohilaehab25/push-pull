let username = prompt("Please enter your name");
console.log(username);

var title_h = document.getElementById('title');
title_h.innerHTML = `User ${username}`;

var chatbox = document.getElementById('chatbox');
var msg_input = document.getElementById('msg');
var send_btn = document.getElementById('send');
var clear_btn = document.getElementById('clear_chat');
var online_div = document.getElementById('onlineusers');

const mywebsocket = new WebSocket('ws://localhost:8000');

mywebsocket.onopen = function () {
    console.log('connection opened', this);
    const message_obj = {
        username: username,
        login: true
    };
    this.send(JSON.stringify(message_obj));
};

mywebsocket.onmessage = function (event) {
    console.log(event.data);
    const msg_content = JSON.parse(event.data);
    if (msg_content.type === 'login') {
        chatbox.innerHTML += `<h3 class="text-center text-success">${msg_content.message}</h3>`;
    } else if (msg_content.type === 'logout') {
        chatbox.innerHTML += `<h3 class="text-center text-danger">${msg_content.message}</h3>`;
    } else if (msg_content.type === 'chat') {
        chatbox.innerHTML += `<h4 class="w-50 bg-dark rounded-2 text-wrap text-light p-2 mx-2">${msg_content.message}</h4>`;
    }

    online_div.innerHTML = '';
    msg_content.online.forEach((element) => {
        online_div.innerHTML += `<li class="list-group-item"><span class="rounded-circle p-1 m-1 bg-success"></span>${element}</li>`;
    });
};

mywebsocket.onerror = function () {
    chatbox.innerHTML += '<h3 style="color: red">Error connecting to server</h3>';
};

send_btn.addEventListener('click', function () {
    const msg_val = msg_input.value;
    const message_obj = {
        body: `${username}: ${msg_val}`
    };
    mywebsocket.send(JSON.stringify(message_obj));
    msg_input.value = '';
});

clear_btn.addEventListener('click', function () {
    chatbox.innerHTML = '';
});

mywebsocket.onclose = function () {
    console.log('Connection closed');
};
