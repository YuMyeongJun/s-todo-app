import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import TodoComponent from "./TodoComponent";
import { TodoProvider } from "../../contexts";

function App() {
  return (
    <TodoProvider>
      <TodoComponent />
    </TodoProvider>
  );
}

describe("Todo 컴포넌트 로드 테스트", () => {
  test("Todo 컴포넌트가 로드되어야한다.", async () => {
    render(<App />);
    // expect(await screen.findByText("할일 목록")).toBeInTheDocument();
  });
});
