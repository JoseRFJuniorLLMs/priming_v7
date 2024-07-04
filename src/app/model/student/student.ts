export class Student {
  _id?: string;
  name?: string;
  bitcoin?: string[];
  books?: string;
  city?: string;
  country?: string;
  courses?: string[];
  date_create?: string; // Timestamp
  email?: string;
  end?: string;
  facebook?: string;
  gender?: string;
  image_url?: string; // Base64
  instagram?: string;
  lessons_done?: string[];
  linkedin?: string;
  list_word_text?: string[];
  login?: string;
  password?: string;
  personal_ident_number?: string;
  phone?: string;
  spoken_language?: string;
  status?: string;
  tax_ident_number?: string;
  tiktok?: string;
  online?: boolean;

  constructor(init?: Partial<Student>) {
    Object.assign(this, init);
  }
}

