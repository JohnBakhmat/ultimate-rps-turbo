import fastify from 'fastify';
import { Server } from 'socket.io';

const io = new Server({});

io.on("connection",(socket)=>{
    console.log(123)
})

io.listen(7070)
