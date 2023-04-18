'use client';

import { useEffect, useRef, useState } from 'react';
import 'hls.js';
import styles from './Player.module.css';
import MessageBubble from './MessageBubble';
import { getUserSource } from '@/lib/source';

function Player() {
  const ref = useRef();
  const player = useRef();
  const [messageBubbleRef, setMessageBubbleRef] = useState();

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const unsubscribes = [];

    import('ovenplayer').then((OvenPlayer) => {
      const ovenPlayer = OvenPlayer.create(ref.current, {
        volume: 25,
        autoStart: false,
        mute: false,
        sources: [getUserSource()],
        webrtcConfig: {
          timeoutMaxRetry: 4,
          connectionTimeout: 10000,
        },
      });
      player.current = ovenPlayer;

      const messageBubbleEl = document.createElement('div');
      ovenPlayer.getContainerElement().appendChild(messageBubbleEl);
      setMessageBubbleRef(messageBubbleEl);

      unsubscribes.push(() => {
        ovenPlayer.remove();
      });
    });

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
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
