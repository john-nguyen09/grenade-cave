'use client';

import { useEffect, useRef } from 'react';
import 'hls.js';
import OvenPlayer from 'ovenplayer';
import { DEFAULT_WEBRTC } from '@/lib/constants';
import styles from './Player.module.css';
import MessageBubble from './MessageBubble';

function Player() {
  const ref = useRef();
  const player = useRef();
  const messageBubbleRef = useRef();

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const ovenPlayer = OvenPlayer.create(ref.current, {
      volume: 25,
      autoStart: false,
      mute: false,
      sources: [DEFAULT_WEBRTC],
      webrtcConfig: {
        timeoutMaxRetry: 4,
        connectionTimeout: 10000,
      },
    });
    player.current = ovenPlayer;

    const messageBubbleEl = document.createElement('div');
    ovenPlayer.getContainerElement().appendChild(messageBubbleEl);
    messageBubbleRef.current = messageBubbleEl;

    return () => {
      ovenPlayer.remove();
    };
  }, [ref]);

  return (
    <>
      <div ref={ref} className={styles.player}></div>
      <MessageBubble messageBubbleRef={messageBubbleRef} />
    </>
  );
}

export default Player;
