import { StudentCollection } from '../student/form/student-collection';

export class NoteCollection {
  _id!: string;
  title?: string;
  created_at?: string;
  description?: string;
  student?: StudentCollection;
  tags?: string;
  answer?: string;
  last_revision_date?: string;
  next_revision_date?: string;
  level?: string;
  permanent?: boolean;
  image?: string;

  constructor(init?: Partial<NoteCollection>) {
    Object.assign(this, init);
    this.initializeReviewDates();
  }

  private initializeReviewDates() {
    const today = new Date().toISOString().split('T')[0];
    if (!this.last_revision_date) {
      this.last_revision_date = today;
    }
    if (!this.next_revision_date) {
      const nextReview = new Date();
      nextReview.setDate(new Date().getDate() + 1);
      this.next_revision_date = nextReview.toISOString().split('T')[0];
    }
  }

  calculateNextReview(response: 'fail' | 'hard' | 'good' | 'easy') {
    const today = new Date();
    let nextReview = new Date(today);

    switch (response) {
      case 'fail':
      case 'hard':
        nextReview = today;
        break;
      case 'good':
        nextReview.setDate(today.getDate() + 1);
        break;
      case 'easy':
        nextReview.setDate(today.getDate() + 2);
        break;
    }

    this.next_revision_date = nextReview.toISOString().split('T')[0];
  }
}
