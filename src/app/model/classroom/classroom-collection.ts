export interface ClassroomCollection {
    id: string;
    alunoId: string;
    curso: string;
    modulo: string;
    prime?: string[];
    target?: string[];
    frase?: string[];
    audioUrls?: string[];
    ImageUrls?: string[];
    videoUrls?: string[];
    text?: string;
  }