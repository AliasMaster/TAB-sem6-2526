// Definicje dla modułów i lekcji (F6 - Materiały edukacyjne)
export interface CourseLesson {
  id: string;
  title: string;
  durationMinutes: number;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: CourseLesson[];
}

// Zaktualizowany główny typ kursu
export interface Course {
  id: string; 
  title: string;
  description: string;
  longDescription: string; // <--- O to krzyczał TypeScript!
  author: string;
  price: number;
  imageUrl: string;
  category: string; 
  rating: number; 
  modules?: CourseModule[]; 
}