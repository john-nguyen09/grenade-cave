import { useEffect, useState } from 'react';
import Image from 'next/image';
import Modal from './Modal';
import Button from './Button';
import Cog from '@/assets/images/cog.svg';
import { globalKV, localKV, messageStore, useLiveState } from '@/lib/liveStore';
import styles from './Settings.module.css';
import Input from './Input';
import { getDefaultSource, getUserSource } from '@/lib/source';
import Checkbox from './Checkbox';
import NekoClientProvider, { useNekoClientContext } from './NekoClientProvider';

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
  const [autoReload, setAutoReload] = useState(false);
  const [autoReloadInterval, setAutoReloadInterval] = useState('');
  const [,adminSendData] = useNekoClientContext();

  const handleOnClickRestartPipeline = () => {
    adminSendData('restartbroadcast');
  };

  const handleOnClearMessagesClick = () => {
    messageStore.delete(0, messageStore.length);
  };

  const handleSaveClick = () => {
    globalKV.set('settings.defaultSourceURL', defaultSource);
    globalKV.set('settings.autoReload', autoReload);
    globalKV.set('settings.autoReloadInterval', autoReloadInterval);
  };

  useEffect(() => {
    setDefaultSource(getDefaultSource().file);
    setAutoReload(globalKV.get('settings.autoReload'));
    setAutoReloadInterval(globalKV.get('settings.autoReloadInterval'));
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
          <Button onClick={handleOnClickRestartPipeline}>
            Restart Pipeline
          </Button>

          <Button onClick={handleOnClearMessagesClick}>Clear Messages</Button>

          <div className={styles.formInline}>
            <Input
              type="text"
              placeholder="Default source"
              appendClassName={styles.sourceInput}
              onChange={(e) => setDefaultSource(e.target.value)}
              value={defaultSource}
            />
          </div>

          <Checkbox
            label="Auto reload"
            appendClassName={styles.autoReloadCheckbox}
            checked={autoReload}
            onChange={(e) => setAutoReload(e.target.checked)}
          />

          <Input
            type="text"
            placeholder="Auto reload interval"
            value={autoReloadInterval}
            onChange={(e) => setAutoReloadInterval(e.target.value)}
          />

          <Button onClick={handleSaveClick}>Save</Button>
        </div>
      )}
    </div>
  );
}

function Settings() {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDangerousSettingsModal, setShowDangerousSettingsModal] =
    useState(false);
  const [showChat, setShowChat] = useLiveState(localKV, 'settings.showChat');
  const [userInControl, setUserInControl] = useLiveState(
    globalKV,
    'control.userId'
  );

  const isInControl = localKV.get('user.id') === userInControl;

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
        variant="danger"
        onClick={() =>
          setShowDangerousSettingsModal(!showDangerousSettingsModal)
        }
      >
        💀
      </Button>
      <Button
        type="button"
        title="Control player"
        onClick={() =>
          setUserInControl(isInControl ? null : localKV.get('user.id'))
        }
      >
        {isInControl ? 'Controlling' : 'Take control'}
      </Button>
      <Button
        type="button"
        onClick={() => setShowChat(!showChat)}
        title="Show chat"
      >
        💬
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
        <NekoClientProvider>
          <DangerousSettingsForm />
        </NekoClientProvider>
      </Modal>
    </div>
  );
}

export default Settings;
