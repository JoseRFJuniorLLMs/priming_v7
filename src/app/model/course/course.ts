import { Lesson } from '../lesson/lesson';

export interface Course {
    _id: string;
    level?: string;
    name?: string;
    content?: string[];
    objective?: string;
    status?: string;
    category?: string;
    price?: string;
    lessons?: Lesson[];
    //lessons?: string[];
  }
