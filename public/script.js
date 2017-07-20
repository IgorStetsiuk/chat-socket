/**
 * Created by Igor on 16.07.2017.
 */



(function () {

    let loginForm = document.querySelector('#login');
    let sendBoxBtn = document.getElementById('msg-board__form');
    let messageInput = document.getElementById('msg-board__input');
    let msgList = document.getElementById('messages__list');
    let usersList = document.getElementById('user__list');
    let modalWin = document.querySelector('.modal');
    let typeLine = document.querySelector('.messages__typing');




    let socket = io.connect();
    messageInput.addEventListener('input', () => {
        socket.emit('typing', socket.nickname);

    });

    socket.on('user typing', (nickname) => {
        typeLine.innerText = '@' + nickname + 'is typing ... ';
        setTimeout(() => {
            typeLine.innerHTML = '';
        }, 3000);
    });


    socket.on('chat history', function (msg) {
        renderMessage(msg);
    });

    function checkCountMessage(msg) {
        let checkMsg = [];
        if (msg > 100) {
            msgList.innerHTML = '';
            checkMsg.slice(-100);
        } else {
            checkMsg = msg;
        }
        return checkMsg;
    }

    function renderMessage(msg) {
       let checkedMsg =checkCountMessage(msg);
        checkedMsg.forEach((message) => {
            let msgItem = document.createElement('li');
            let msgDate = document.createElement('p');
            let msgAuthor = document.createElement('span');
            let msgText = document.createElement('p');

            msgItem.className = 'messages__item';
            msgDate.className = 'messages__time';
            msgAuthor.className = 'messages__author';
            msgText.className = 'messages__text';

            msgDate.innerText = message.dateOfPost;
            msgAuthor.innerText = message.owner;
            msgText.innerText = message.text;

            msgItem.appendChild(msgText);
            msgItem.appendChild(msgAuthor);
            msgItem.appendChild(msgDate);
            msgList.appendChild(msgItem);
        })
    };

    socket.on('new message', (data) => {
        if (Array.isArray(data)) {
            renderMessage(data)
        } else {
            let msg = [data];
            renderMessage(msg);
        }
    });

    sendBoxBtn.addEventListener('submit', (event) => {

        let message = {
            text: messageInput.value,
            dateOfPost: new Date().toLocaleString().split(', '),
            owner: socket.nickname
        };
        if (message.text === '') {
            return;
        }
        messageInput.value = '';
        socket.emit('new message', message);
        event.preventDefault();
    });

    loginForm.addEventListener('submit', (event) => {

        const userName = loginForm.name.value;
        const nickname = loginForm.nickname.value;
        if (userName === '' || nickname === '') return false;
        modalWin.style.display = 'none';
        socket.emit('user data', {userName, nickname}, function (nickname) {
            alert(`nickname : ${nickname} is taken, try another`);
            modalWin.style.display = 'block';
        });

        socket.nickname = nickname;

        event.preventDefault();
    });

    socket.on('user err', (data) => {
        console.log('user ' + data.nickname + ' exist');
    });

    let statuses = ['online'];
    socket.on('users nicknames', (data) => {
       let ul = [...usersList.children];
        ul.forEach((el) => {
            el.remove()
        });
        data.forEach((user) => {
            let userItem = document.createElement('li');
            let name = document.createElement('span');
            let nick = document.createElement('span');
            let status = document.createElement('span');

            userItem.className = 'user__item';
            nick.className = 'user__nick';
            name.className = 'user__name';
            status.className = 'user__status';

            name.innerHTML = user.userName;
            nick.innerHTML = '@' + user.nickname;
            status.innerHTML = statuses[0];
            userItem.appendChild(name);
            userItem.appendChild(nick);
            userItem.appendChild(status);
            usersList.appendChild(userItem);
        })
    });
})();
