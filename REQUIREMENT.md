# 과제 설명

* 요구사항을 충족하는 To-Do List Application을 제공된 패키지 파일에  작성한 후 zip 파일로 압축하여 제출하시기 바랍니다.
* API는 Mock Service Worker(MSW)로 제공된 패키지 파일 내에 포함되어 있습니다.
  - MSW 는 browser context 에서 동작하도록 setupWorker로 설정 되어있습니다. 따라서 Local 환경일지라도 Postman, cURL 등 브라우저 외부에서의 API 호출은 응답을 받을 수 없습니다.
* 프로그램으로 구현 완료 후 소스코드와 Application에 대한 설명을 README.md파일에 작성하여 제출하시면 됩니다.

# Application 요구 사항

요구사항과 제공된 API Spec에 맞게 To-Do List Application을 구현해주세요.

### 기능 요구사항

- 화면 상단에서 신규 To-Do 입력하여 목록에 추가할 수 있습니다.
  - 내용 및 기한(날짜) 입력이 가능합니다.
- Row 단위로 선택하여 수정이 가능합니다.
- 항목 별 완료 처리가 가능하고 완료된 항목에 대해 인지할 수 있도록 표시합니다.
- Multiple Row 선택 후 삭제가 가능합니다.
- 기한이 3일 이내로 남은 경우 사용자가 인지할 수 있도록 표시합니다.
- List는 Page Size 5, 10, 20 중 선택하여 페이지로 표시하거나 Infinite Scroll로 표시합니다.
- 리스트 내에서 검색 기능을 제공합니다. (검색 키워드는 브라우저를 다시 열었을 때 유지되도록 합니다.)

### 비기능 요구 사항

- styled component 등을 사용하여 자유롭게 사용자에게 거부감 없는 디자인 반영해주세요.
- MUI, Ant Design 등 UI Library는 자유롭게 사용하세요.
- 구성된 내용을 문서(README.md)로 정리해주시기 바랍니다.
- Commit History를 확인할 수 있도록 과제 결과물의 압축 실행 시 .git 디렉토리를 포함시켜주세요.

# API Spec

### Types

```tsx
interface ToDo {
  id: number; // PK
  text: string; // To-Do 내용
  done: boolean;  // 완료 여부
  deadline: number; // 기한 (timestamp - milliseconds)
}

interface APIResponse<T> {
  code: number, // HTTP Code
  message?: string,  // message
  data?: T,
}

type ToDoRequest = Omit<ToDo, 'id'>;
```

### Fetch ToDos

```tsx
Endpoint: /api/todos
Method: GET
Response: APIResponse<ToDo[]>
Example:
  {
    code: 200,
    message: '',
    data: [
      {id: 1, text: "To do", done: false, deadline: 1645434638682},
    ]
  }
```

### Create ToDo

```tsx
Endpoint: /api/todos
Method: POST
Request: ToDoRequest
Example:
  {
    text: "To do", done: false, deadline: 1645434638682,
  }
Response: APIResponse<ToDo>
Example:
  {
    code: 200,
    message: '',
    data: {
      id: 2, text: "To do", done: false, deadline: 1645434638682,
    }
  }

```

### Get ToDo

```tsx
Endpoint: /api/todos/{id}
Method: GET
Response: APIResponse<ToDo>
Example:
  {
    code: 200,
    message: '',
    data: {id: 1, text: "To do", done: false, deadline: 1645434638682}
  }

```

### Update ToDo

```tsx
Endpoint: /api/todos/{id}
Method: PUT
Request: ToDoRequest
Example:
  { text: "To do", done: false, deadline: 1645434638682}
Response: APIResponse<ToDo>
Example:
  {
    code: 200,
    message: '',
    data: { id, 2, text: "To do", done: false, deadline: 1645434638682}
  }
```

### Delete ToDo

```tsx
Endpoint: /api/todos/{id}
method: DELETE
Response: APIResponse<void>
Example:
  {
    code: 200,
    message: ''
  }
```
