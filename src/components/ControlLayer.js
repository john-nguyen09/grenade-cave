import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { createKeyboard } from '@/lib/nekoClient';
import styles from './ControlLayer.module.css';
import { useNekoClientContext } from './NekoClientProvider';
import { globalKV, useLiveState } from '@/lib/liveStore';

const WHEEL_LINE_HEIGHT = 19;

const KEY_TABLE = {
  XK_ISO_Level3_Shift: 0xfe03, // AltGr
  XK_Mode_switch: 0xff7e, // Character set switch
  XK_Control_L: 0xffe3, // Left control
  XK_Control_R: 0xffe4, // Right control
  XK_Meta_L: 0xffe7, // Left meta
  XK_Meta_R: 0xffe8, // Right meta
  XK_Alt_L: 0xffe9, // Left alt
  XK_Alt_R: 0xffea, // Right alt
  XK_Super_L: 0xffeb, // Left super
  XK_Super_R: 0xffec, // Right super
};

const hasMacOSKbd = () => {
  return /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
};

const keyMap = (key) => {
  // Alt behaves more like AltGraph on macOS, so shuffle the
  // keys around a bit to make things more sane for the remote
  // server. This method is used by noVNC, RealVNC and TigerVNC
  // (and possibly others).
  if (hasMacOSKbd()) {
    switch (key) {
      case KEY_TABLE.XK_Meta_L:
        key = KEY_TABLE.XK_Control_L;
        break;
      case KEY_TABLE.XK_Super_L:
        key = KEY_TABLE.XK_Alt_L;
        break;
      case KEY_TABLE.XK_Super_R:
        key = KEY_TABLE.XK_Super_L;
        break;
      case KEY_TABLE.XK_Alt_L:
        key = KEY_TABLE.XK_Mode_switch;
        break;
      case KEY_TABLE.XK_Alt_R:
        key = KEY_TABLE.XK_ISO_Level3_Shift;
        break;
    }
  }

  return key;
};

function ControlLayerContent() {
  const [sendData] = useNekoClientContext();
  const [scrollInvert, setScrollInvert] = useState(true);
  const ref = useRef();
  const keyboard = useRef(createKeyboard());
  const wheelThrottle = useRef(false);

  const [w] = useLiveState(globalKV, 'settings.screenWidth', 1920);
  const [h] = useLiveState(globalKV, 'settings.screenHeight', 1080);

  const scroll = 2;

  const sendMousePos = (e) => {
    const rect = e.target.getBoundingClientRect();
    const destination = {
      x: Math.round((w / rect.width) * (e.clientX - rect.left)),
      y: Math.round((h / rect.height) * (e.clientY - rect.top)),
    };
    sendData('mousemove', destination);
  };

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    keyboard.current.listenTo(ref.current);

    keyboard.current.onkeydown = (key) => {
      sendData('keydown', { key: keyMap(key) });
    };

    keyboard.current.onkeyup = (key) => {
      sendData('keyup', { key: keyMap(key) });
    };
  }, [ref, sendData]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)
    ) {
      ref.current.setAttribute('readonly', 'readonly');

      const handleTouchMove = (e) => {
        e.preventDefault();
      };

      document.body.addEventListener('touchmove', handleTouchMove);

      return () => {
        document.body.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [ref]);

  const onTouchHandler = (e) => {
    e.stopPropagation();
    e.preventDefault();

    let first = e.changedTouches[0];
    let type = '';
    switch (e.type) {
      case 'touchstart':
        type = 'mousedown';
        break;
      case 'touchmove':
        type = 'mousemove';
        break;
      case 'touchend':
        type = 'mouseup';
        break;
      default:
        return;
    }

    const simulatedEvent = new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      view: window,
      screenX: first.screenX,
      screenY: first.screenY,
      clientX: first.clientX,
      clientY: first.clientY,
    });
    first.target.dispatchEvent(simulatedEvent);
  };

  return (
    <textarea
      ref={ref}
      className={styles.root}
      tabIndex="0"
      data-gramm="false"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onContextMenu={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onMouseMove={(e) => {
        e.stopPropagation();
        e.preventDefault();

        sendMousePos(e);
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();

        sendMousePos(e);
        sendData('mousedown', { key: e.button + 1 });
      }}
      onMouseUp={(e) => {
        e.stopPropagation();
        e.preventDefault();

        sendMousePos(e);
        sendData('mouseup', { key: e.button + 1 });
        e.target.focus();
      }}
      onWheel={(e) => {
        e.stopPropagation();
        e.preventDefault();

        let x = e.deltaX;
        let y = e.deltaY;

        // Pixel units unless it's non-zero.
        // Note that if deltamode is line or page won't matter since we aren't
        // sending the mouse wheel delta to the server anyway.
        // The difference between pixel and line can be important however since
        // we have a threshold that can be smaller than the line height.
        if (e.deltaMode !== 0) {
          x *= WHEEL_LINE_HEIGHT;
          y *= WHEEL_LINE_HEIGHT;
        }

        if (scrollInvert) {
          x = x * -1;
          y = y * -1;
        }

        x = Math.min(Math.max(x, -scroll), scroll);
        y = Math.min(Math.max(y, -scroll), scroll);

        sendMousePos(e);

        if (!wheelThrottle.current) {
          wheelThrottle.current = true;
          sendData('wheel', { x, y });

          window.setTimeout(() => {
            wheelThrottle.current = false;
          }, 100);
        }
      }}
      onTouchStart={onTouchHandler}
      onTouchEnd={onTouchHandler}
      onTouchMove={onTouchHandler}
    ></textarea>
  );
}

function ControlLayer({ controlLayerRef }) {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  if (!isBrowser || !controlLayerRef) {
    return null;
  }

  return ReactDOM.createPortal(<ControlLayerContent />, controlLayerRef);
}

export default ControlLayer;
