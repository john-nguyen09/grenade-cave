import { DEFAULT_WEBRTC } from './constants';
import { globalKV, localKV } from './liveStore';

export function getDefaultSource() {
  const file = globalKV.get('settings.defaultSourceURL') || DEFAULT_WEBRTC.file;

  return {
    type: detectProtocolFromURL(file),
    file,
  };
}

export function detectProtocolFromURL(url) {
  let protocol = null;

  if (url.indexOf('ws:') === 0 || url.indexOf('wss:') === 0) {
    protocol = 'webrtc';
  } else if (url.indexOf('http:') === 0 || url.indexOf('https:') === 0) {
    if (url.indexOf('.m3u8') > 0) {
      protocol = 'hls';

      if (url.endsWith('llhls.m3u8')) {
        protocol = 'll-hls';
      }
    } else if (url.indexOf('.mpd') > 0) {
      protocol = 'dash';
    } else if (url.indexOf('.mp4') > 0) {
      protocol = 'http';
    }
  }

  return protocol;
}

export function getUserSource() {
  const localFile = localKV.get('settings.sourceURL');

  if (!localFile) {
    return getDefaultSource();
  }

  return {
    type: detectProtocolFromURL(localFile),
    file: localFile,
  };
}
