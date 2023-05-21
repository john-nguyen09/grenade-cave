import { useEffect, useRef, useState } from 'react';
import { globalKV, localKV, useLiveState } from './liveStore';
import GuacamoleKeyboard from './guacamole-keyboard';

export const OPCODE = Object.freeze({
  MOVE: 0x01,
  SCROLL: 0x02,
  KEY_DOWN: 0x03,
  KEY_UP: 0x04,
  RESTART_BROADCAST: 0x06,
});

function encodeData(event, data) {
  let buffer;
  let payload;
  switch (event) {
    case 'mousemove':
      buffer = new ArrayBuffer(7);
      payload = new DataView(buffer);
      payload.setUint8(0, OPCODE.MOVE);
      payload.setUint16(1, 4, true);
      payload.setUint16(3, data.x, true);
      payload.setUint16(5, data.y, true);
      break;
    case 'wheel':
      buffer = new ArrayBuffer(7);
      payload = new DataView(buffer);
      payload.setUint8(0, OPCODE.SCROLL);
      payload.setUint16(1, 4, true);
      payload.setInt16(3, data.x, true);
      payload.setInt16(5, data.y, true);
      break;
    case 'keydown':
    case 'mousedown':
      buffer = new ArrayBuffer(11);
      payload = new DataView(buffer);
      payload.setUint8(0, OPCODE.KEY_DOWN);
      payload.setUint16(1, 8, true);
      payload.setBigUint64(3, BigInt(data.key), true);
      break;
    case 'keyup':
    case 'mouseup':
      buffer = new ArrayBuffer(11);
      payload = new DataView(buffer);
      payload.setUint8(0, OPCODE.KEY_UP);
      payload.setUint16(1, 8, true);
      payload.setBigUint64(3, BigInt(data.key), true);
      break;
    case 'restartbroadcast':
      console.log('Here');
      buffer = new ArrayBuffer(1);
      payload = new DataView(buffer);
      payload.setUint8(0, OPCODE.RESTART_BROADCAST);
      break;
    default:
      this.emit('warn', `unknown data event: ${event}`);
  }

  return payload;
}

function encodeAdminTrigger(event) {
  let buffer;
  let payload;
  switch (event) {
    case 'restartbroadcast':
      buffer = new ArrayBuffer(1);
      payload = new DataView(buffer);
      payload.setUint8(0, OPCODE.RESTART_BROADCAST);
      break;
    default:
      this.emit('warn', `unknown data event: ${event}`);
  }

  return payload;
}

export function useNekoClient() {
  const ws = useRef(null);
  const [userInControl] = useLiveState(globalKV, 'control.userId');
  const [connectCount, setConnectCount] = useState(0);

  useEffect(() => {
    ws.current = new WebSocket('wss://cave.thuan.au/live-control?type=client');

    ws.current.onclose = () => {
      ws.current = null;
      // Re-try to connect
      setTimeout(() => {
        setConnectCount(connectCount + 1);
      }, 5000);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [connectCount]);

  useEffect(() => {
    setConnectCount((count) => count + 1);
  }, []);

  const sendData = (event, data) => {
    if (!ws.current) {
      return;
    }

    if (ws.current.readyState !== WebSocket.OPEN) {
      return;
    }

    if (userInControl !== localKV.get('user.id')) {
      return;
    }

    ws.current.send(encodeData(event, data));
  };

  const adminSendData = (event) => {
    if (!ws.current) {
      return;
    }

    if (ws.current.readyState !== WebSocket.OPEN) {
      return;
    }

    ws.current.send(encodeAdminTrigger(event));
  };

  return [sendData, adminSendData];
}

export function createKeyboard() {
  const keyboard = {};

  GuacamoleKeyboard.bind(keyboard)();

  return keyboard;
}
