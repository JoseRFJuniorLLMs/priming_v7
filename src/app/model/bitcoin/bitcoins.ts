export interface BitCoin {
    _id?: string;
    name: string;
    description: string;
    primeCoinValue: number;
    bitcoinValue: number;
    lastUpdated: string; 
    ownerId: string;
    transactionHistory: string[]; 
    initialBalance: number;
    publicKey: string;
    privateKey: string;
    creationDate: string;
    issue: string;
    dateupdate: string; 
  }
  