//TODO:
//Get rid of hardcoded user and roomid
//create fake login screen to simulate authorization
//input box with login credentials and then take that and call hookUpChatKit()
// check loginUser first -> success -> loadWindow with that current User -> show chat windows
// check loginUser first -> failure -> input user name -> load window
var ROOM_ID;
var currentUser;

window.onload = function(e) {
    if(authenticateUser()) {
        loadChatManager();
    } else {
        if(currentUser == null) {
            document.getElementById('modalContainer').style.display='block';
            document.getElementById('roomContainer').style.display='none';
        }
    }
}

function authenticateUser() {
    if(currentUser != null) {
        document.getElementById('roomContainer').style.display='block';
        document.getElementById('modalContainer').style.display='none';
        return true;
    }
    return false;
}

function loginUser() {
    var usernameInput = document.getElementById('uname').value;
    currentUser = usernameInput;
    document.getElementById('roomContainer').style.display='block';
    document.getElementById('modalContainer').style.display='none';
    loadChatManager();
}

function loadChatManager() {
    console.log('loginUser success');
    const chatManager = hookUpChatKit();
    console.log(chatManager);
    if(chatManager !== null) {
        chatManager.connect()
            .then(loadedCurrentUser => {
            currentUser = loadedCurrentUser;
            ROOM_ID = currentUser.rooms[0].id;
            currentUser.subscribeToRoomMultipart({
            roomId: ROOM_ID,
            hooks: {
                onMessage: message => {
                console.log("Received message:", message.parts[0].payload.content)
                }
            },
            messageLimit: 0
            }).then(response => {
                loadChatroom();
            })
            .catch(err => {
                console.log("error");
                console.log(err)
            })
        });
    }
}

function hookUpChatKit() {
    const tokenProvider = new Chatkit.TokenProvider({
        url: "https://us1.pusherplatform.io/services/chatkit_token_provider/v1/c8cfadcc-721b-45c0-8d74-afa5e0d49452/token"
      });
    const chatManager = new Chatkit.ChatManager({
        instanceLocator: "v1:us1:c8cfadcc-721b-45c0-8d74-afa5e0d49452",
        //key: "e14a9168-5f4e-4d08-9e9f-56cefe8f0256:wNS8tHTBvfooEjGB2wy/mF3+OqL0DZstqKHu8AlzKA0="
        userId: currentUser,
        tokenProvider: tokenProvider
    });
    return chatManager;
}

function loadChatroom() {

    console.log(currentUser);
    console.log("currentUser");
    var roomNode = document.createElement("h3");
    var roomName = document.createTextNode(currentUser.rooms[0].name);
    roomNode.appendChild(roomName);
    document.getElementById('currentRoom').appendChild(roomNode);
    currentUser.fetchMultipartMessages({
        roomId: ROOM_ID,
        direction: 'older',
        limit: 25,
    })
    .then(messages => {
        for(var i = 0; i < messages.length; i++) {
            var node = document.createElement("LI")
            var authorMessages = document.createTextNode(messages[i].sender.name + ": ");
            var writeMessages = document.createTextNode(messages[i].parts[0].payload.content);
            node.appendChild(authorMessages);
            node.appendChild(writeMessages);
            // node.appendChild(messageSent)
            document.getElementById('messages').appendChild(node);
        }
    })
    .catch(err => {
        console.log( `Error fetching messages: ${err}`)
        console.log(err)
    })
}

function sendMessageToRoom() {
    const text = document.getElementById("message-text").value;
    if( !text ) {
        alert('please enter a message')
    } else {
        currentUser.sendSimpleMessage({
            roomId: ROOM_ID,
            text: text,
          })
          .then(messageId => {
            console.log(`Added message to ${ROOM_ID}`)
            var currentMessages = document.getElementById('messages');
            var node = document.createElement("LI")
            var userNameNode = document.createTextNode(currentUser.name + ": ");
            var textNode = document.createTextNode(text);
            node.appendChild(userNameNode);
            node.appendChild(textNode);
            currentMessages.after(node);

          })
          .catch(err => {
            console.log(`Error adding message to ${ROOM_ID}: ${err}`)
          })
    }
}
