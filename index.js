const express = require('express');
const { createServer } = require('node:http');
const fs = require("fs");
const { Server } = require('socket.io');
let PORT = process.env.PORT || 3001;

const app = express();
const server = createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');

let timer = 600;

let timA = "";
let scorea = 0;
let falla = 0;

let timB = "";
let scoreb = 0;
let fallb = 0;

let timerCount = null;

io.on('connection', (socket) => {
  socket.on("timerStart", () => {
    console.log("TIMER START");
    timerCount = setInterval(() => {
      if (timer > 0) {
        timer--;
        io.emit("countdown", timer);
        writeFile(secondToMinute(timer), "Timer.txt");
      } else clearInterval(timerCount);
    }, 1000);
  });

  socket.on("timerStop", () => {
    console.log("TIMER STOP");
    clearInterval(timerCount);
  });

  socket.on("timer", (sec) => {
    timer = sec;
    io.emit("timer", sec)
    writeFile(secondToMinute(sec), "Timer.txt");
  });

  socket.on("scorea", (score) => {
    scorea = score;
    io.emit("scorea", score)
    writeFile(score, "Tim A Score.txt");
  });

  socket.on("scoreb", (score) => {
    scoreb = score;
    io.emit("scoreb", score)
    writeFile(score, "Tim B Score.txt");
  });

  socket.on("falla", (fall) => {
    falla = fall;
    io.emit("falla", fall)
    writeFile(fall, "Tim A Fall.txt");
  });

  socket.on("fallb", (fall) => {
    fallb = fall;
    io.emit("fallb", fall)
    writeFile(fall, "Tim B Fall.txt");
  });

  socket.on("tima", (tim) => {
    timA = tim;
    io.emit("tima", tim)
    writeFile(timA, "Tim A.txt");
  });

  socket.on("timb", (tim) => {
    timB = tim;
    io.emit("timb", tim)
    writeFile(timB, "Tim B.txt");
  });
});

app.get("/", (req, res) => {
  res.render("index", { timer, isStart: !!timerCount, scorea, scoreb, falla, fallb, timA, timB });
});

server.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});


server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error('Address in use, retrying...');
    setTimeout(() => {
      server.close();
      PORT++;
      server.listen(PORT);
    }, 1000);
  }
});

function writeFile(value, pathFile) {
  fs.writeFileSync(`./obs/${pathFile}`, value)
}

function secondToMinute(second) {
  return zeroPad(Math.floor(timer / 60)) + ":" + zeroPad(Math.floor(timer % 60))
}

function zeroPad(num) {
  return num.toString().padStart(2, "0");
}