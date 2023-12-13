import './style.css';
import { HuddleClient } from '@huddle01/web-core';

const client = new HuddleClient({
  projectId: 'TxG-OolMwGeCoZPzX660e65wwuU2MP83',
});

let token = '';
let roomId = '';
let displayName = '';
let showInput = true;

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
              muted
            />
          </div>
          <div class="w-1/2 mx-auto border-2 rounded-xl border-blue-400 object-contain">
            <video
              id="screenRef"
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

document.querySelector('#video').addEventListener('click', async () => {
  const videoRef = document.querySelector('#videoRef');

  if (videoRef.srcObject) {
    videoRef.srcObject.getTracks().forEach((track) => track.stop());
    videoRef.srcObject = null;
    document.querySelector('#video').textContent = 'Enable Video';
    return;
  }

  const streamResponse = await client.localPeer.deviceHandler.fetchStream({
    mediaDeviceKind: 'cam',
  });

  const stream = streamResponse.stream;

  client.localPeer.produceStream({
    label: 'cam',
    stream: stream,
  });

  console.log('stream', stream);

  videoRef.srcObject = stream;
  videoRef.onloadedmetadata = async () => {
    console.warn('videoCard() | Metadata loaded...');
    try {
      await videoRef.play();
      document.querySelector('#video').textContent = 'Disable Video';
    } catch (error) {
      console.error(error);
    }
  };

  videoRef.onerror = () => {
    console.error('videoCard() | Error is hapenning...');
  };
});

document.querySelector('#audio').addEventListener('click', async () => {
  await client.localPeer.enableAudio();
});

document.querySelector('#screen').addEventListener('click', async () => {
  const screenRef = document.querySelector('#screenRef');

  if (screenRef.srcObject) {
    screenRef.srcObject.getTracks().forEach((track) => track.stop());
    screenRef.srcObject = null;
    document.querySelector('#screen').textContent = 'Share Screen';
    return;
  }

  const streamResponse = await client.localPeer.deviceHandler.fetchScreen();

  const stream = streamResponse.stream;

  client.localPeer.produceStream({
    label: 'screen',
    stream: stream,
  });

  console.log('stream', stream);

  screenRef.srcObject = stream;
  screenRef.onloadedmetadata = async () => {
    console.warn('videoCard() | Metadata loaded...');
    try {
      await screenRef.play();
      document.querySelector('#screen').textContent = 'Stop Sharing';
    } catch (error) {
      console.error(error);
    }
  };

  screenRef.onerror = () => {
    console.error('videoCard() | Error is hapenning...');
  };
});

client.room.on('new-peer-joined', (peer) => {
  console.log('new-peer-joined', peer);
  console.log('here it is');
  const remotePeers = document.querySelector('#remotePeers');
  const remotePeer = document.createElement('div');
  remotePeer.id = peer.id;
  remotePeer.innerHTML = `
  <div class="flex flex-col gap-2">
    <div class="w-1/2 mx-auto border-2 rounded-xl border-blue-400 object-contain">
      <video
        id="${peer.id}-video"
        autoPlay
        muted
      />
    </div>
    <div class="w-1/2 mx-auto border-2 rounded-xl border-blue-400 object-contain">
      <video
        id="${peer.id}-screen"
        autoPlay
        muted
      />
    </div>
  </div>
  `;
  console.log('remote', peer.peer.getConsumer());
  document.querySelector(`#${peer.id}-video`).srcObject = peer.peer
    .getConsumer('video')
    .track();
  remotePeers.appendChild(remotePeer);
});

client.room.on('stream-added', ({ peerId, label }) => {
  console.log('new-peer-joined', peer);
  console.log(
    'remote',
    client.room.getRemotePeerById(peerId).peer.getConsumer(label)?.track()
  );
});
