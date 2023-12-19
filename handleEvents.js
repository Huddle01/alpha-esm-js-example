import { client } from "./client";

export function handleEvents() {
  client.room.on("stream-added", ({ peerId, label }) => {
    console.log(
      "remote",
      client.room.getRemotePeerById(peerId)?.getConsumer(label)?.track,
      label
    );
    const container = document.querySelector("#remotePeers");
    let mediaRef = document.createElement("video");
    if (label == "audio") {
      mediaRef = document.createElement("audio");
    }
    const remoteTrack = client.room
      .getRemotePeerById(peerId)
      ?.getConsumer(label)?.track;

    mediaRef.srcObject = new MediaStream([remoteTrack]);
    mediaRef.id = `${peerId}-${label}`;
    mediaRef.autoplay = true;
    if (label == "video") {
      mediaRef.muted = true;
    }
    mediaRef.className = "border-2 rounded-xl border-white-400 aspect-video";
    container.appendChild(mediaRef);
  });

  client.room.on("stream-closed", ({ peerId, label }) => {
    console.log("stream-closed", peerId, label);
    const mediaRef = document.querySelector(`#${peerId}-${label}`);
    mediaRef.srcObject.getTracks().forEach((track) => track.stop());
    mediaRef.srcObject = null;
    mediaRef.remove();
  });
}
