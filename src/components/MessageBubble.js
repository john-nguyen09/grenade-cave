'use client';

import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import ReactDOMClient from 'react-dom/client';
import { MinPriorityQueue } from '@datastructures-js/priority-queue';
import styles from './MessageBubble.module.css';
import { messageStore } from '@/lib/liveStore';

const MESSAGE_INSERT_DURATION = 1000;

const messageState = {
  idCounter: 1,
  after: 0,
  messageQueue: new MinPriorityQueue((message) => message.sentAt),
  container: null,
  timeout: null,
};
const messageElements = [];

function createMessageElement(message) {
  const el = document.createElement('div');
  el.classList.add(styles.disappearingMessage);

  ReactDOMClient.createRoot(el).render(
    <span>
      <span className={styles.author} style={{ color: message.color }}>
        {message.name}:{' '}
      </span>
      {message.text}
    </span>
  );

  el.addEventListener('animationend', () => {
    el.remove();
  });

  return el;
}

function startMessageQueueLoop() {
  if (messageState.timeout) {
    return;
  }

  processNextMessage();
}

function processNextMessage() {
  messageState.timeout = null;
  if (messageState.messageQueue.size() === 0) {
    return;
  }

  const message = messageState.messageQueue.pop();

  const el = createMessageElement(message);
  messageState.container.appendChild(el);

  messageState.timeout = setTimeout(
    processNextMessage,
    MESSAGE_INSERT_DURATION
  );
}

function MessageBubbleContent() {
  const ref = useRef();

  useEffect(() => {
    const handleMessageUpdate = ({ changes }) => {
      const { added } = changes;

      added.forEach((item) => {
        item.content.getContent().forEach((message) => {
          if (message.sentAt < messageState.after) {
            return;
          }

          messageState.messageQueue.push(message);
        });
      });
      startMessageQueueLoop();
    };

    messageStore.observe(handleMessageUpdate);
    messageState.container = ref.current;

    return () => {
      messageStore.unobserve(handleMessageUpdate);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (messageElements.length >= 20) {
        return;
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <div className={styles.container} ref={ref}></div>;
}

function MessageBubble({ messageBubbleRef }) {
  const [isBrowser, setIsBrowser] = useState();

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  if (!isBrowser || !messageBubbleRef.current) {
    return null;
  }

  return ReactDOM.createPortal(
    <MessageBubbleContent />,
    messageBubbleRef.current
  );
}

export default MessageBubble;
