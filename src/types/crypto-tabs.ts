export type CryptoTab = 'mainstream' | 'meme' | 'others' | 'wallet';

export interface TabConfig {
  key: CryptoTab;
  label: string;
  icon: string;
} 