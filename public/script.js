const form = document.getElementById("send-container");
const messageInput = document.getElementById("messageInp");
const messageContainer = document.querySelector(".container");

const name = prompt("Enter your name");

socket.on("receive", (data) => {
    append(`${data.name}: ${data.message}`, "left");
  });
  
  form.addEventListener("submit", (e) => {
    e.preventDefault();
  
    const message = messageInput.value;
  
    append(`You: ${message}`, "right");
  
    socket.emit("send", message);
  
    messageInput.value = "";
  });
  