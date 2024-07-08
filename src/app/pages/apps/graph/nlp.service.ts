import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

@Injectable({
  providedIn: 'root'
})
export class NlpService {
  private model: any;

  constructor(private dataService: DataService) {
    this.loadModel();
  }

  async loadModel() {
    await tf.setBackend('webgl');  // Definindo o backend
    this.model = await use.load();
  }

  async getEmbeddings(sentences: string[]): Promise<any> {
    if (!this.model) {
      await this.loadModel();
    }
    return this.model.embed(sentences);
  }

  cosineSimilarity(vecA: any, vecB: any): number {
    const dotProduct = tf.sum(tf.mul(vecA, vecB)).dataSync()[0];  // Corrigido para calcular o produto escalar corretamente
    const magnitudeA = tf.norm(vecA).dataSync()[0];  // Corrigido para calcular a magnitude corretamente
    const magnitudeB = tf.norm(vecB).dataSync()[0];  // Corrigido para calcular a magnitude corretamente
    return dotProduct / (magnitudeA * magnitudeB);
  }

  async calculateSimilarities(sentences: string[]): Promise<number[][]> {
    const embeddings = await this.getEmbeddings(sentences);
    const similarities = [];
    for (let i = 0; i < embeddings.shape[0]; i++) {
      const row = [];
      for (let j = 0; j < embeddings.shape[0]; j++) {
        const vecA = embeddings.slice([i, 0], [1, -1]).reshape([-1]);  // Garantir que o vetor seja 1D
        const vecB = embeddings.slice([j, 0], [1, -1]).reshape([-1]);  // Garantir que o vetor seja 1D
        const similarity = this.cosineSimilarity(vecA, vecB);
        row.push(similarity);
      }
      similarities.push(row);
    }
    return similarities;
  }

  getPrimeToTargetMapping(): { [key: string]: string } {
    return this.dataService.getPrimeToTargetMapping();
  }

  getColorMapping(): { [key: string]: string } {
    return this.dataService.getColorMapping();
  }
}
