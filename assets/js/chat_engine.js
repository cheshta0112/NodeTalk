class ChatEngine {
  constructor(chatBoxId, userEmail) {
    this.chatBox = $(`#${chatBoxId}`);
    this.userEmail = userEmail;

    this.socket = io.connect("http://localhost:5000", {
      withCredentials: true,
    }); // io is the global variable available to us after the socket cdn

    if (this.userEmail) {
      this.connectionHandler();
    }
  }

  connectionHandler() {
    this.socket.on("connect", () => {
      console.log("Connection established using sockets...!");
    });
  }
}
