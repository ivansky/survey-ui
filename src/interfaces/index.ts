interface Question {
  text: string;
}

interface Survey {
  title: string;
  description: string;
  questions: Question[];
}
