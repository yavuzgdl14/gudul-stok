export interface DoorStock {
  sag: number;
  sol: number;
}

export interface AppInventory {
  amerikanPanel: {
    [model: string]: {
      kapali: DoorStock;
      camli: DoorStock;
      wc: DoorStock;
    };
  };
  melamin: {
    [model: string]: {
      kapali: number;
      camli: number;
      wc: number;
    };
  };
  pvc: {
    [model: string]: {
      kapali: number;
      camli: number;
      wc: number;
    };
  };
  celikKapilar: {
    [model: string]: DoorStock;
  };
  kasalar: {
    amerikanPanel: {
      [size: string]: {
        lik70: number;
        lik80: number;
      };
    };
    melamin: {
      [size: string]: {
        lik70: number;
        lik80: number;
      };
    };
    pvc: {
      [size: string]: {
        lik70: number;
        lik80: number;
      };
    };
  };
}

export type CategoryKey = 'amerikanPanel' | 'melamin' | 'pvc' | 'celikKapilar' | 'kasalar' | 'ozet';
