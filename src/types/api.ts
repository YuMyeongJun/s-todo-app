export interface ToDo {
  id: number; // PK
  text: string; // To-Do 내용
  done: boolean;  // 완료 여부
  deadline: number; // 기한 (timestamp - milliseconds)
}

export interface APIResponse<T> {
  code: number, // HTTP Code
  message?: string,  // message
  data?: T,
}

export type ToDoRequest = Omit<ToDo, 'id'>;