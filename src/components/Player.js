'use client';

import { useEffect, useRef, useState } from 'react';
import 'hls.js';
import styles from './Player.module.css';
import MessageBubble from './MessageBubble';
import { getUserSource } from '@/lib/source';
import { globalKV } from '@/lib/liveStore';

function Player() {
  const player = useRef();
  const [messageBubbleRef, setMessageBubbleRef] = useState();

  useEffect(() => {
    const unsubscribes = [];

    import('ovenplayer').then((OvenPlayer) => {
      let ovenPlayer = null;
      let reloadTimeout = null;

      const updateReload = () => {
        if (!ovenPlayer) {
          return;
        }

        if (
          !globalKV.get('settings.autoReload') ||
          !globalKV.get('settings.autoReloadInterval')
        ) {
          return;
        }

        ovenPlayer.once('error', (e) => {
          console.log(e);

          if (reloadTimeout) {
            clearTimeout(reloadTimeout);
            reloadTimeout = null;
          }

          reloadTimeout = setTimeout(() => {
            unloadPlayer();
            loadPlayer();
          }, globalKV.get('settings.autoReloadInterval'));
        });
      };

      const loadPlayer = () => {
        if (ovenPlayer) {
          ovenPlayer.remove();
          ovenPlayer = null;
        }

        ovenPlayer = OvenPlayer.create('player', {
          volume: 100,
          autoStart: true,
          autoFallback: true,
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

        updateReload();
      };

      const unloadPlayer = () => {
        ovenPlayer && ovenPlayer.remove();
        ovenPlayer = null;
        player.current = null;
      };

      globalKV.on('change', updateReload);
      loadPlayer();

      unsubscribes.push(() => {
        unloadPlayer();
        globalKV.off('change', updateReload);
      });
    });

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  return (
    <>
      <div className={styles.player} id="player"></div>
      <MessageBubble messageBubbleRef={messageBubbleRef} />
    </>
  );
}

export default Player;
