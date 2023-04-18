import { useEffect, useState } from 'react';
import Image from 'next/image';
import Modal from './Modal';
import Button from './Button';
import Cog from '@/assets/images/cog.svg';
import { globalKV, localKV, messageStore } from '@/lib/liveStore';
import styles from './Settings.module.css';
import Input from './Input';
import { getDefaultSource, getUserSource } from '@/lib/source';

function SettingsForm() {
  const [userSource, setUserSource] = useState('');

  const handleSaveSourceClick = () => {
    localKV.set('settings.sourceURL', userSource);
  };

  useEffect(() => {
    setUserSource(getUserSource().file);
  }, []);

  return (
    <div>
      <label>User source</label>
      <div className={styles.formInline}>
        <Input
          type="text"
          placeholder="Default source"
          appendClassName={styles.sourceInput}
          onChange={(e) => setUserSource(e.target.value)}
          value={userSource}
        />
        <Button onClick={handleSaveSourceClick}>Save</Button>
      </div>
    </div>
  );
}

function DangerousSettingsForm() {
  const [show, setShow] = useState(false);
  const [defaultSource, setDefaultSource] = useState('');

  const handleOnClearMessagesClick = () => {
    messageStore.delete(0, messageStore.length);
  };

  const handleSaveSourceClick = () => {
    globalKV.set('settings.defaultSourceURL', defaultSource);
  };

  useEffect(() => {
    setDefaultSource(getDefaultSource().file);
  }, []);

  return (
    <div>
      <p>🚨🚨🚨Danger 🚨 Danger 🚨 Danger🚨🚨🚨</p>
      <p>&nbsp;</p>
      <Button variant="danger" onClick={() => setShow(true)}>
        Proceed
      </Button>

      {show && (
        <div className={styles.dangerousFormBody}>
          <Button onClick={handleOnClearMessagesClick}>Clear Messages</Button>

          <div className={styles.formInline}>
            <Input
              type="text"
              placeholder="Default source"
              appendClassName={styles.sourceInput}
              onChange={(e) => setDefaultSource(e.target.value)}
              value={defaultSource}
            />
            <Button onClick={handleSaveSourceClick}>Save</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Settings() {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDangerousSettingsModal, setShowDangerousSettingsModal] =
    useState(false);

  return (
    <div className={styles.container}>
      <Button
        type="button"
        onClick={() => setShowSettingsModal(!showSettingsModal)}
      >
        <Image src={Cog.src} width="24" height="24" alt="Settings" />
      </Button>
      <Button
        type="button"
        appendClassName={styles.deadButton}
        variant="danger"
        onClick={() =>
          setShowDangerousSettingsModal(!showDangerousSettingsModal)
        }
      >
        💀
      </Button>

      <Modal
        title="Settings"
        show={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        closeOnOverlayClick
      >
        <SettingsForm />
      </Modal>

      <Modal
        title="Dangerous Area"
        show={showDangerousSettingsModal}
        onClose={() => setShowDangerousSettingsModal(false)}
        closeOnOverlayClick
      >
        <DangerousSettingsForm />
      </Modal>
    </div>
  );
}

export default Settings;
