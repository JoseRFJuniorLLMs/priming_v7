import { StudentCollection } from '../student/form/student';

export class TagsCollection {
  _id!: string;
  description?: string;
  name?: string;
  student_id?: StudentCollection;
  constructor(init?: Partial<TagsCollection>) {
    Object.assign(this, init);
  }
}
