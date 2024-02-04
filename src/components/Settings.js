import { useEffect, useState } from 'react';
import Image from 'next/image';
import Modal from './Modal';
import Button from './Button';
import Cog from '@/assets/images/cog.svg';
import { globalKV, localKV, messageStore, useLiveState } from '@/lib/liveStore';
import styles from './Settings.module.css';
import Input from './Input';
import { getDefaultSource } from '@/lib/source';
import Checkbox from './Checkbox';
import NekoClientProvider, { useNekoClientContext } from './NekoClientProvider';

function SettingsForm() {
  const [userSource, setUserSource] = useState(localKV.get('settings.sourceURL') || '');

  const handleSaveSourceClick = () => {
    localKV.set('settings.sourceURL', userSource);
  };

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
  const [, adminSendData] = useNekoClientContext();

  const [defaultSource, setDefaultSource] = useState(getDefaultSource().file);
  const [autoReload, setAutoReload] = useState(globalKV.get('settings.autoReload'));
  const [autoReloadInterval, setAutoReloadInterval] = useState(globalKV.get('settings.autoReloadInterval'));
  const [screenWidth, setScreenWidth] = useState(globalKV.get('settings.screenWidth') || 1920);
  const [screenHeight, setScreenHeight] = useState(globalKV.get('settings.screenHeight') || 1080);

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
    globalKV.set('settings.screenWidth', screenWidth);
    globalKV.set('settings.screenHeight', screenHeight);
  };

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

          <div className={styles.formInline}>
            <Input
              type="number"
              placeholder="Screen Width (px)"
              value={screenWidth}
              onChange={(e) => setScreenWidth(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Screen Height (px)"
              value={screenHeight}
              onChange={(e) => setScreenHeight(e.target.value)}
            />
          </div>

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
