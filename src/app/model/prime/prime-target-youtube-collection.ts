export class PrimeTargetYoutubeCollection {
    _id: string;
    prime: string;
    target: string;
    url: string[];
  
    constructor(_id: string, prime: string, target: string, url: string[]) {
      this._id = _id;
      this.prime = prime;
      this.target = target;
      this.url = url;
    }
  }
  