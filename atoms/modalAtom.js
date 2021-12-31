import { atom } from 'recoil';

export const modalState = atom({
  key: 'modalState',
  default: false,
});

export const profileExistState = atom({
  key: 'profileExistState',
  default: true,
});

export const postIdState = atom({
  key: 'postIdState',
  default: '',
});
