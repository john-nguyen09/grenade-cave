import { v4 as uuidv4 } from 'uuid';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { YKeyValue } from 'y-utility/y-keyvalue';
import { generateName } from './name';
import { generateColor } from './color';
import { LIVE_STATE_URL } from './constants';

export const store = {
  globalDoc: new Y.Doc(),
  localDoc: new Y.Doc(),
  persist: null,
  ws: null,
  awareness: null,
};

const { globalDoc, localDoc } = store;
export const globalKV = new YKeyValue(globalDoc.getArray('global'));
export const messageStore = globalDoc.getArray('messages');
export const localKV = new YKeyValue(localDoc.getArray('local'));
let promiseChain = init();

export async function init() {
  const docName = 'grenade-cave';

  const provider = new IndexeddbPersistence(`${docName}-global`, globalDoc);
  const wsProvider = new WebsocketProvider(LIVE_STATE_URL, docName, globalDoc);
  const localProvider = new IndexeddbPersistence(`${docName}-local`, localDoc);
  const promises = [];
  const { awareness } = wsProvider;

  store.persist = provider;
  store.ws = wsProvider;
  store.awareness = awareness;

  promises.push(
    new Promise((resolve) => {
      provider.on('synced', resolve);
    })
  );

  promises.push(
    new Promise((resolve) => {
      localProvider.on('synced', resolve);
    })
  );

  promises.push(
    new Promise((resolve) => {
      wsProvider.on('synced', resolve);
    })
  );

  await Promise.all(promises);
}

export function userInit() {
  if (localKV.has('user.id')) {
    userEnter();
    return;
  }

  localKV.set('user.id', uuidv4());
  localKV.set('user.name', generateName());
  localKV.set('user.color', generateColor(globalKV));
  userEnter();
}

export function userEnter() {
  console.log(
    `Entering as: ${localKV.get('user.id')} - ${localKV.get('user.name')}`
  );

  const updateUserToGlobalStore = () => {
    store.ws.awareness.setLocalState({
      id: localKV.get('user.id'),
      name: localKV.get('user.name'),
      color: localKV.get('user.color'),
    });
  };

  updateUserToGlobalStore();
  localKV.on('change', () => {
    updateUserToGlobalStore();
  });
}

export function ensureInit(cb) {
  return promiseChain.then(cb);
}

export function messageAdd(text) {
  const id = localKV.get('user.id');
  const name = localKV.get('user.name');
  const color = localKV.get('user.color');

  if (!id || !name || !color) {
    return;
  }

  messageStore.unshift([{ id, name, color, text, sentAt: new Date().getTime() }]);
}
