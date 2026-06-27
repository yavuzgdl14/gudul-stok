import { AppInventory } from '../types';

export const INITIAL_INVENTORY: AppInventory = {
  amerikanPanel: {
    'Madra': {
      kapali: { sag: 15, sol: 12 },
      camli: { sag: 8, sol: 7 },
      wc: { sag: 2, sol: 4 },
    },
    'Merdiven': {
      kapali: { sag: 10, sol: 10 },
      camli: { sag: 5, sol: 4 },
      wc: { sag: 3, sol: 2 },
    },
    'Yumurta': {
      kapali: { sag: 8, sol: 9 },
      camli: { sag: 4, sol: 5 },
      wc: { sag: 1, sol: 3 },
    },
    'D Modeli': {
      kapali: { sag: 6, sol: 7 },
      camli: { sag: 2, sol: 2 },
      wc: { sag: 0, sol: 1 },
    },
    'Kum Saati': {
      kapali: { sag: 12, sol: 10 },
      camli: { sag: 6, sol: 6 },
      wc: { sag: 4, sol: 3 },
    },
  },
  melamin: {
    'Çift Göbek': { kapali: 14, camli: 8, wc: 5 },
    'Tek Göbek': { kapali: 10, camli: 6, wc: 4 },
    'Melamin Madra': { kapali: 18, camli: 12, wc: 8 },
    'Matrix': { kapali: 12, camli: 5, wc: 3 },
  },
  pvc: {
    '407': { kapali: 24, camli: 16, wc: 10 },
  },
  celikKapilar: {
    'Yeni Model': { sag: 8, sol: 6 },
    'Uzun Kol': { sag: 5, sol: 4 },
    'TOKİ': { sag: 12, sol: 14 },
    'Antrasit Gri': { sag: 4, sol: 3 },
    'Antrasit Beyaz': { sag: 8, sol: 8 },
    'A.S.': { sag: 6, sol: 7 },
    'Tangarika': { sag: 9, sol: 8 },
    'Ceviz': { sag: 11, sol: 10 },
    'Beyaz': { sag: 15, sol: 12 },
    'Antrasit PVC': { sag: 3, sol: 5 },
    'Beyaz PVC': { sag: 7, sol: 6 },
  },
  kasalar: {
    amerikanPanel: {
      '10': { lik70: 15, lik80: 20 },
      '12': { lik70: 12, lik80: 18 },
      '14': { lik70: 10, lik80: 15 },
      '15': { lik70: 8, lik80: 12 },
      '17': { lik70: 14, lik80: 16 },
      '22': { lik70: 6, lik80: 8 },
      '24': { lik70: 5, lik80: 7 },
    },
    melamin: {
      '10': { lik70: 10, lik80: 12 },
      '12': { lik70: 8, lik80: 10 },
      '14': { lik70: 9, lik80: 11 },
      '16': { lik70: 7, lik80: 8 },
      '22': { lik70: 4, lik80: 5 },
    },
    pvc: {
      '12': { lik70: 12, lik80: 15 },
      '16': { lik70: 8, lik80: 10 },
      '22': { lik70: 5, lik80: 6 },
    },
  },
};
