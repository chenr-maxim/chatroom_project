window.onload = function(e) {
    const chatManager = hookUpChatKit();
    const ROOM_ID = '19707012'

    chatManager
    .connect()
        .then(currentUser => {
        console.log(currentUser.rooms);
        console.log(currentUser.roomSubscriptions);
        currentUser.subscribeToRoomMultipart({
        roomId: currentUser.rooms[0].id,
        hooks: {
            onMessage: message => {
            console.log("Received message:", message.parts[0].payload.content)
            }
        },
        messageLimit: 0
        }).then(response => {
            fetchMessages(currentUser);
        })
        .catch(err => {
            console.log("error");
        })
    });

    function fetchMessages(currentUser) {
        currentUser.fetchMultipartMessages({
            roomId: ROOM_ID,
            direction: 'older',
            limit: 10,
        })
        .then(messages => {
            for(var i = 0; i < messages.length; i++) {
                var node = document.createElement("LI")
                var writeMessages = document.createTextNode(messages[i].parts[0].payload.content);
                node.appendChild(writeMessages);
                document.getElementById('messages').appendChild(node);
            }
        })
        .catch(err => {
            console.log( `Error fetching messages: ${err}`)
            console.log(err)
        })
    }
}

function hookUpChatKit() {
    const tokenProvider = new Chatkit.TokenProvider({
        url: "https://us1.pusherplatform.io/services/chatkit_token_provider/v1/c8cfadcc-721b-45c0-8d74-afa5e0d49452/token"
      });
    
    const chatManager = new Chatkit.ChatManager({
        instanceLocator: "v1:us1:c8cfadcc-721b-45c0-8d74-afa5e0d49452",
        //key: "e14a9168-5f4e-4d08-9e9f-56cefe8f0256:wNS8tHTBvfooEjGB2wy/mF3+OqL0DZstqKHu8AlzKA0="
        userId: "testuser2",
        tokenProvider: tokenProvider
    });
    return chatManager
}

