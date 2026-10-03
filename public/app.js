const socket = io();

const roomInput = document.getElementById("room");
const joinBtn = document.getElementById("join");
const micBtn = document.getElementById("mic");
const stopBtn = document.getElementById("stop");
const statusEl = document.getElementById("status");
const remoteAudio = document.getElementById("remoteAudio");

let room = "";
let pc = null;
let localStream = null;

const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
};

function createPeerConnection() {
  pc = new RTCPeerConnection(config);

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("signal", {
        room,
        candidate: event.candidate
      });
    }
  };

  pc.ontrack = (event) => {
    remoteAudio.srcObject = event.streams[0];
    remoteAudio.play().catch(() => {});
  };

  pc.onconnectionstatechange = () => {
    statusEl.textContent = "Connection: " + pc.connectionState;
  };
}

joinBtn.onclick = () => {
  room = roomInput.value.trim();

  if (!room) {
    alert("Room code enter karein.");
    return;
  }

  socket.emit("join-room", room);
  joinBtn.disabled = true;
  roomInput.disabled = true;
  micBtn.disabled = false;
  statusEl.textContent = "Joined room. Waiting for connection...";
};

micBtn.onclick = async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });

    if (!pc) createPeerConnection();

    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream);
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("signal", {
      room,
      offer
    });

    micBtn.disabled = true;
    stopBtn.disabled = false;
    statusEl.textContent = "Microphone is ON";
  } catch (error) {
    statusEl.textContent = "Microphone permission denied or unavailable.";
    console.error(error);
  }
};

stopBtn.onclick = () => {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }

  stopBtn.disabled = true;
  micBtn.disabled = false;
  statusEl.textContent = "Microphone stopped.";
};

socket.on("peer-joined", () => {
  statusEl.textContent = "Other device joined.";
});

socket.on("signal", async (data) => {
  if (!pc) createPeerConnection();

  if (data.offer) {
    await pc.setRemoteDescription(data.offer);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("signal", {
      room,
      answer
    });
  }

  if (data.answer) {
    await pc.setRemoteDescription(data.answer);
  }

  if (data.candidate) {
    try {
      await pc.addIceCandidate(data.candidate);
    } catch (error) {
      console.error("ICE candidate error:", error);
    }
  }
});￼Enter
