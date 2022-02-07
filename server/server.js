
const io = require('socket.io')(3000, {
    cors:{
        origin:["http://10.44.137.90:8080"]
    }
});

io.on("connection", socket => {
    socket.on("send-message", (message, room) => {
        if (room === '') {
            socket.broadcast.emit("recieve-message", socket.username + ": " + message)
        }
        socket.to(room).emit("recieve-message", socket.username + ": " + message)
    })
    socket.on("join-room", (room, cb) => {
        socket.join(room)
        getSocketsRoom(room);
        cb(`You joined the room: ${room}`)
        socket.to(room).emit("recieve-message", socket.username + ": " + "Joined the room!")
    })
    socket.on("leave-room", (room, cb) => {
        socket.leave(room)
        getSocketsRoom(room);
        cb(`You left the room: ${room}`)
        socket.to(room).emit("recieve-message", socket.username + ": " + "Left the room!")
    })
    socket.on("set-name", (nickname) => {
        socket.username = nickname
        getSockets()
        
    })
    socket.on("disconnect", (reason) => {
        console.log("User disconnected: " + reason);
        getSockets();
        io.emit("recieve-message", socket.username + ": Left the chat")
    })
    socket.on("is-typing", (state) =>{ 
        if (state === true) {
            io.emit("user-typing", socket.username + " is typing...")
        }
        else if (state === false) {
            io.emit("user-stop-typing")
        }
    })
})

async function getSockets() {
    const sockets = await io.fetchSockets()
    let usernames = [];
    for (const socket of sockets) {
        usernames.push(socket.username)

        io.emit("populate-all", usernames)
    }
}

async function getSocketsRoom(room){
    const sockets = await io.in(room).fetchSockets()
    let usernames = [];
    for (const socket of sockets) {
        usernames.push(socket.username)

        io.in(room).emit("populate-room", usernames)
    }
}

