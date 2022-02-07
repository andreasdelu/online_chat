import { io} from "socket.io-client"

const joinRoomButton = document.getElementById("room-button");
const leaveRoomButton = document.getElementById("leave-button");
const messageInput = document.getElementById("message-input");
const roomInput = document.getElementById("room-input");
const form = document.getElementById("form");
const allList = document.getElementById("all-list");
const roomList = document.getElementById("room-list");



const socket = io("http://10.44.137.90:3000")

const storage = window.sessionStorage;

function updateScroll(){
    const messageContainer = document.getElementById("message-container");
    console.log(messageContainer.scrollTop + 300)
    console.log("height" + messageContainer.scrollHeight)
    if (messageContainer.scrollTop + 350 > messageContainer.scrollHeight) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }
    else return;
}

socket.on("connect", () => {
    displayMessage(`Connected!`);
    setName();
    
    
})

function setName() {
    let nickname;
    if (storage.getItem("nickname") == null) {
        nickname = prompt("Username: ");
        if (nickname == null || nickname == '') {
            const nickname = socket.id.substring(0,6);
            socket.emit("set-name", nickname);
        }
        else if (nickname == storage.getItem("nickname")) {
            socket.emit("set-name", nickname);
            displayMessage("Your nickname is already: " + nickname);
        }
        
        else {
            socket.emit("set-name", (nickname));
            displayMessage("Your nickname is now: " + nickname);
            storage.setItem("nickname", nickname);
        }
    }
    else {
        nickname = storage.getItem("nickname");
        socket.emit("set-name", (nickname));
        displayMessage("Your nickname is now: " + nickname);
    }
}

socket.on("recieve-message", (message) => {
    displayMessage(message);
    updateScroll();
})

socket.on("populate-all", online => {
    populateAll(online);
})
socket.on("populate-room", online => {
    populateRoom(online);
})


form.addEventListener("submit", e => {
    e.preventDefault();
    const message = messageInput.value;
    const room = roomInput.value;

    if (message === "") return
    yourMessage(message)
    socket.emit("send-message", message, room)
    messageInput.value = ""
    updateScroll();
})

joinRoomButton.addEventListener("click", () => {
    const room = roomInput.value;
    socket.emit("join-room", room, message => {
        displayMessage(message);
    })
})
leaveRoomButton.addEventListener("click", () => {
    const room = roomInput.value;
    roomList.innerHTML = '';
    roomInput.value = '';
    socket.emit("leave-room", room, message => {
        displayMessage(message);
    })
})
/* nameButton.addEventListener("click", () => {
    if (nameInput.value == storage.getItem("nickname")) {
        const nickname = nameInput.value;
        displayMessage("Your nickname is already: " + nickname);
    }
    else {
        const nickname = nameInput.value;
        socket.emit("set-name", (nickname));
        displayMessage("Your nickname is now: " + nickname);
        storage.setItem("nickname", nickname);
    }
    if (nameInput.value == '') {
        const nickname = socket.id.substring(0,6);
        socket.emit("set-name", nickname);
        nameInput.value = nickname;
    }
}) */

function displayMessage(message) {
    const div = document.createElement("div")
    div.textContent = message
    div.classList.add("message")
    document.getElementById("message-container").append(div)
}

function yourMessage(message) {
    const div = document.createElement("div")
    div.textContent = "You: " + message
    div.classList.add("you")
    document.getElementById("message-container").append(div)
    
}

function populateAll(list) {
    allList.innerHTML = '';
    list = list.sort();
    for (const user of list) {
        const li = document.createElement("li")
        li.textContent = user
        allList.append(li)
    }
}
function populateRoom(list) {
    roomList.innerHTML = '';
    list = list.sort();
    for (const user of list) {
        const li = document.createElement("li")
        li.textContent = user
        roomList.append(li)
    }
}