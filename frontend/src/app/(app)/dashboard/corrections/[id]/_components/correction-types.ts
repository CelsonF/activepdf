export interface FieldItem {
  id: string;
  type: string;
  label: string;
  studentAnswer: string | boolean | null;
  correct: boolean | null;
  feedback: string | null;
}

export interface CorrectionState {
  correct: boolean | null;
  feedback: string;
}
