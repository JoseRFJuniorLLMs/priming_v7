import { Course } from '../model/course/course';
import { CoursePage } from '../model/course/course-page';

export const coursesMock: Course[] = [
  {
    _id: '1',
    name: 'Basic English',
    category: 'Language',
    lessons: [
      {
        _id: '1',
        name: 'Basic English 1',
        youtubeUrl: '2OHbjep_WjQ'
      }
    ]
  },
  {
    _id: '2',
    name: 'English for Travel',
    category: 'Language',
    lessons: [
      {
        _id: '2',
        name: 'English for Travel',
        youtubeUrl: '2OHbyep_WjQ'
      }
    ]
  }
];

export const coursesPageMock: CoursePage = {
  courses: coursesMock,
  totalElements: 2,
  totalPages: 1
};
