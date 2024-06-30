// text-item.interface.ts
export interface TextItem {
    _id: {
      $oid: string;
    };
    prime: string;
    target: string;
    text: string;
    level:string;
  }
  