export interface FaqDTO {
  id: string;
  question: string;
  answer: string;
}

export interface FaqBodyDTO {
  question: string | null;
  answer: string | null;
}
