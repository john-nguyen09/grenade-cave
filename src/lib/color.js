import { COLORS } from './constants';

export function generateColor(kv) {
  let colorCounter = kv.get('user.colorCounter');
  if (!colorCounter) {
    colorCounter = 0;
  }
  const nextColorCounter = colorCounter >= COLORS.length ? 0 : colorCounter + 1;
  kv.set('user.colorCounter', nextColorCounter);

  return COLORS[colorCounter];
}
