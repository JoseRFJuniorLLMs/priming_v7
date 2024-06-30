export class PrimeTargetFraseCollection {
    _id: string;
    prime: string;
    target: string;
    phrases: string[];
    url: string[];
    imagem: string[];
  
    constructor(_id: string, prime: string, target: string, phrases: string[], url: string[], imagem: string[]) {
      this._id = _id;
      this.prime = prime;
      this.target = target;
      this.phrases = phrases;
      this.url = url;
      this.imagem = imagem;
    }
  }