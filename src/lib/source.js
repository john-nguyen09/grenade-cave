import { DEFAULT_WEBRTC } from './constants';
import { globalKV, localKV } from './liveStore';

export function getDefaultSource() {
  return {
    ...DEFAULT_WEBRTC,
    file: globalKV.get('settings.defaultSourceURL') || DEFAULT_WEBRTC.file,
  };
}

export function getUserSource() {
  const localFile = localKV.get('settings.sourceURL');

  if (!localFile) {
    return getDefaultSource();
  }

  return {
    type: DEFAULT_WEBRTC.type,
    file: localFile,
  };
}
