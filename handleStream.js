import { client } from './client';

export function handleAudioStream(element) {
  element.addEventListener('click', async () => {
    const audioRef = document.querySelector('#audio');
    if (audioRef.textContent == 'Enable Audio') {
      await client.localPeer.enableAudio();
      audioRef.textContent = 'Disable Audio';
    } else {
      await client.localPeer.disableAudio();
      audioRef.textContent = 'Enable Audio';
    }
  });
}

export function handleVideoStream(element) {
  element.addEventListener('click', async () => {
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
      label: 'video',
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
}

export function handleScreenStream(element) {
  element.addEventListener('click', async () => {
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
}
