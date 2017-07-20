/**
 * Created by Igor on 16.07.2017.
 */

let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let bodyParser = require('body-parser');


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/script.js', (req, res) => {
    res.sendFile(__dirname + '/public/script.js')
});

app.get('/style.css', (req, res) => {
    res.sendFile(__dirname + '/public/css/style.css')
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


let messages = [];
let userNicknames = [];
let usersData = [];
let clients = [];

io.on('connection', function (socket) {
    clients.push(socket.id);
    console.log('Client connected');
    socket.on('user data', (userData, callback) => {
        console.log(userData);
        if (userNicknames.indexOf(userData.nickname) !== -1) {
            callback(userData.nickname);

        } else {
            userNicknames.push(userData.nickname);
            socket.nickname = userData.nickname;
            usersData.push(userData);
            updateUsers(usersData);
        }
    });


    function updateUsers(data) {
        io.emit('users nicknames', data);
    }


    socket.on('new message', function (msg) {
        console.log(msg);
        messages.push(msg);
        io.emit('new message', msg)
    });
    socket.emit('chat history', messages);

    socket.on('typing', (nickname) => {
        socket.broadcast.emit('user typing', nickname);
    });


    socket.on('disconnect', function () {
        console.log('user disconnected');
        if (!socket.nickname) {
            return;
        }
        userNicknames.splice(userNicknames.indexOf(socket.nickname), 1);
        updateUsers(usersData);
    });

});


http.listen(5000, () => {
    console.log('listening on :5000')
});