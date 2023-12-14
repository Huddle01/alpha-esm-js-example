import {
  handleAudioStream,
  handleScreenStream,
  handleVideoStream,
} from './handleStream';
import './style.css';
import { client } from './client';

let token = '';
let roomId = '';
let displayName = '';

document.querySelector('#app').innerHTML = `
<div class="flex flex-col items-center justify-center p-4">
<div class="flex">
    <input
      placeholder="Room ID"
      id="roomId"
      type="text"
      class="border-2 border-blue-400 rounded-lg p-2 mx-2 bg-black text-white"
    />

    <input
      placeholder="Access Token"
      id="accessToken"
      type="text"
      class="border-2 border-blue-400 rounded-lg p-2 mx-2 bg-black text-white"
    />

    <input
      placeholder="Display Name"
      id="displayName"
      type="text"
      class="border-2 border-blue-400 rounded-lg p-2 mx-2 bg-black text-white"
    />

    <button
      type="button"
      id="joinRoom"
      class="bg-blue-500 p-2 mx-2 rounded-lg"
    >
      Join Room
    </button>

    <button
      class="bg-blue-500 p-2 mx-2 rounded-lg"
      id="video"
    >
    Enable Video
    </button>
    <button
      class="bg-blue-500 p-2 mx-2 rounded-lg"
      id="audio"
    >
    Enable Audio
    </button>
    <button
      class="bg-blue-500 p-2 mx-2 rounded-lg"
      id="screen"
    >
    Share Screen
    </button>
</div>

      <div class="flex-1 items-center flex flex-col mt-8">
        <div class="flex gap-2">
          <div class="w-1/2 mx-auto border-2 rounded-xl border-blue-400 object-contain">
            <video
              id="videoRef"
              autoPlay
              class="aspect-video"
              muted
            />
          </div>
          <div class="w-1/2 mx-auto border-2 rounded-xl border-blue-400 object-contain">
            <video
              id="screenRef"
              class="aspect-video"
              autoPlay
              muted
            />
          </div>
        </div>
        
      </div>
      <div id="remotePeers" class="flex flex-col gap-2 mt-4">
        </div>
      </div>

`;

document.querySelector('#roomId').addEventListener('change', (e) => {
  roomId = e.target.value;
});

document.querySelector('#accessToken').addEventListener('change', (e) => {
  token = e.target.value;
});

document.querySelector('#displayName').addEventListener('change', (e) => {
  displayName = e.target.value;
});

document.querySelector('#joinRoom').addEventListener('click', async () => {
  const room = await client.joinRoom({
    roomId,
    token,
  });
  room.updateMetadata({
    displayName: displayName,
  });
  document.querySelectorAll('input').forEach((input) => {
    input.hidden = true;
  });
});

handleVideoStream(document.querySelector('#video'));

handleScreenStream(document.querySelector('#screen'));

handleAudioStream(document.querySelector('#audio'));

client.room.on('stream-added', ({ peerId, label }) => {
  console.log(
    'remote',
    client.room.getRemotePeerById(peerId)?.getConsumer(label)?.track,
    label
  );
  const container = document.querySelector('#remotePeers');
  let mediaRef = document.createElement('video');
  if (label == 'audio') {
    mediaRef = document.createElement('audio');
  }
  const remoteTrack = client.room
    .getRemotePeerById(peerId)
    ?.getConsumer(label)?.track;

  mediaRef.srcObject = new MediaStream([remoteTrack]);
  mediaRef.id = `${peerId}-${label}`;
  mediaRef.autoplay = true;
  if (label == 'video') {
    mediaRef.muted = true;
  }
  mediaRef.className = 'border-2 rounded-xl border-white-400 aspect-video';
  container.appendChild(mediaRef);
});

client.room.on('stream-closed', ({ peerId, label }) => {
  console.log('stream-closed', peerId, label);
  const mediaRef = document.querySelector(`#${peerId}-${label}`);
  mediaRef.srcObject.getTracks().forEach((track) => track.stop());
  mediaRef.srcObject = null;
  mediaRef.remove();
});
