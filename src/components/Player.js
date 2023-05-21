'use client';

import { useEffect, useState } from 'react';
import styles from './Player.module.css';
import MessageBubble from './MessageBubble';
import { getUserSource } from '@/lib/source';
import { ensureInit, globalKV } from '@/lib/liveStore';
import ControlLayer from './ControlLayer';
import NekoClientProvider from './NekoClientProvider';

function Player() {
  const [messageBubbleRef, setMessageBubbleRef] = useState();
  const [controlLayerRef, setControlLayerRef] = useState();

  useEffect(() => {
    const unsubscribes = [];

    let ovenPlayer = null;
    let reloadTimeout = null;

    const initPlayer = async () => {
      const Hls = (await import('hls.js')).default;
      window.Hls = Hls;
      const OvenPlayer = (await import('ovenplayer')).default;

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

        const messageBubbleEl = document.createElement('div');
        ovenPlayer.getContainerElement().appendChild(messageBubbleEl);
        setMessageBubbleRef(messageBubbleEl);

        const controlLayerEl = document.createElement('div');
        ovenPlayer.getContainerElement().appendChild(controlLayerEl);
        setControlLayerRef(controlLayerEl);

        updateReload();
      };

      const unloadPlayer = () => {
        ovenPlayer && ovenPlayer.remove();
        ovenPlayer = null;
      };

      globalKV.on('change', updateReload);
      ensureInit(() => loadPlayer());

      unsubscribes.push(() => {
        unloadPlayer();
        globalKV.off('change', updateReload);
      });
    };

    initPlayer();

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  return (
    <NekoClientProvider>
      <div className={styles.player} id="player"></div>
      <MessageBubble messageBubbleRef={messageBubbleRef} />
      <ControlLayer controlLayerRef={controlLayerRef} />
    </NekoClientProvider>
  );
}

export default Player;
