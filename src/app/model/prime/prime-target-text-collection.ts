export class PrimeTargetTextCollection {
    _id: string;
    prime: string;
    target: string;
    text: string;
  
    constructor(_id: string, prime: string, target: string, text: string) {
      this._id = _id;
      this.prime = prime;
      this.target = target;
      this.text = text;
    }
  }