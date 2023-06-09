'use client';

import {
  ensureInit,
  localKV,
  messageStore,
  store,
  useLiveState,
  userInit,
} from '@/lib/liveStore';
import { useEffect, useState } from 'react';
import styles from './People.module.css';
import Pencil from '@/assets/images/pencil.svg';
import Image from 'next/image';
import Modal from './Modal';
import EditUserForm from './EditUserForm';
import MessageForm from './MessageForm';
import { format, formatDistance, formatRelative, isSameDay } from 'date-fns';
import Settings from './Settings';
import classNames from 'classnames';

function People() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showChat, setShowChat] = useLiveState(
    localKV,
    'settings.showChat',
    false
  );

  useEffect(() => {
    const onUserChange = () => {
      setUsers(Array.from(store.awareness.getStates().values()));
    };

    const onMessageUpdate = () => {
      setMessages(messageStore.slice(0, 100));
    };

    ensureInit(() => {
      store.awareness.on('update', onUserChange);
      messageStore.observe(onMessageUpdate);

      userInit();
      onMessageUpdate();
    });

    const interval = setInterval(() => {
      setMessages((messages) => [...messages]);
    }, 1000);

    return () => {
      store.awareness.off('update', onUserChange);
      messageStore.unobserve(onMessageUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleEditUserNameClick = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
      <div>
        <Settings />
        <div className={styles.users}>
          {users.map((user) => {
            const isCurrent = user.id === localKV.get('user.id');

            return (
              <div
                key={user.id}
                className={styles.user}
                style={{ color: user.color }}
              >
                {user.name} {isCurrent && '(You)'}
                {isCurrent && (
                  <a
                    href="#"
                    className={styles.editButton}
                    onClick={handleEditUserNameClick}
                  >
                    <Image
                      src={Pencil.src}
                      width={16}
                      height={16}
                      alt="Edit your name"
                    />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div
        className={classNames(styles.chat, {
          [styles.open]: showChat,
        })}
      >
        <MessageForm />
        <div className={styles.messages}>
          {messages.map(({ name, color, text, sentAt }, index) => {
            let relativeDate = '';
            if (sentAt) {
              if (isSameDay(sentAt, new Date())) {
                relativeDate = formatDistance(sentAt, new Date(), {
                  addSuffix: true,
                });
              } else {
                relativeDate = formatRelative(sentAt, new Date());
              }
            }

            return (
              <div key={index} className={styles.message}>
                <div style={{ color }} className={styles.author}>
                  {name}
                </div>
                <div className={styles.messageText}>{text}</div>
                {relativeDate && (
                  <div
                    className={styles.sentAt}
                    title={format(sentAt, 'd MMMM yyyy h:maaa')}
                  >
                    {relativeDate}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <Modal
        title="Edit your user name"
        show={showModal}
        onClose={() => setShowModal(false)}
        closeOnOverlayClick
      >
        <EditUserForm onSubmit={() => setShowModal(false)} />
      </Modal>
    </div>
  );
}

export default People;
