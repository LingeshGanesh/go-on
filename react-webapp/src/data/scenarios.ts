import { Scenario } from '../types';

export const scenarios: Scenario[] = [
  {
    id: 'chinese_waiter',
    title: 'Restaurant Order',
    description: 'Practice ordering food and drinks at a chinese restaurant',
    category: 'Dining',
    difficulty: 'Beginner',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop',
    language: 'Chinese',
    lcode: 'zh'
  },
  {
    id: 'japanese_barista',
    title: 'Coffee Shop Order',
    description: 'Learn how to speak Japanese through ordering coffee',
    category: 'Dining',
    difficulty: 'Intermediate',
    imageUrl: 'https://images.pexels.com/photos/2159065/pexels-photo-2159065.jpeg?cs=srgb&dl=pexels-quang-nguyen-vinh-222549-2159065.jpg&fm=jpg',
    language: 'Japanese',
    lcode: 'ja'

  },
  {
    id: 'malay_teacher',
    title: 'School Lesson',
    description: 'Learn how to converse in Malay with a teacher',
    category: 'Education',
    difficulty: 'Advanced',
    imageUrl: 'https://thumbs.dreamstime.com/b/beautiful-malay-teacher-wearing-traditional-cloth-school-malay-school-teacher-150440571.jpg',
    language: 'Malay',
    lcode: 'my'
  }
];