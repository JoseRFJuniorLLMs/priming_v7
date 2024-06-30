import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DashboardAnalyticsService {
  constructor() {}

  /* ==================ALARME==================== */
  playSound(soundUrl: string) {
    const audio = new Audio(soundUrl);
    audio.play().catch((error) => console.error('Erro ao tocar o som:', error));
  } //fim
}
