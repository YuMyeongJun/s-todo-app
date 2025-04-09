/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  RenderResult,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TodoComponent from "./TodoComponent";
import { TodoProvider } from "../../contexts/TodoContext";

// Constants
const TEST_TODO_COUNT = 5; // 15개에서 5개로 줄임 (성능 최적화)
const TEST_DEADLINE = Date.now() + 86400000;
const WAIT_TIMEOUT = 1000; // waitFor 타임아웃 설정

// Types
interface MockTodo {
  /** 할일 고유 아이디 */
  id: number;
  /** 할일 내용 */
  text: string;
  /** 할일 완료 여부 */
  done: boolean;
  /** 할일 만료 시간 */
  deadline: number;
}

/** 모킹 설정 */
const setupMocks = () => {
  /** Mock 옵저버 */
  const mockIntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  }));
  window.IntersectionObserver = mockIntersectionObserver;

  /** Mock fetch */
  const mockFetch = vi.fn();
  (window as any).fetch = mockFetch;
  return mockFetch;
};

/** 모킹 투두 생성 */
const createMockTodos = (count: number): MockTodo[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    text: `할일 ${i + 1}`,
    done: false,
    deadline: TEST_DEADLINE,
  }));

/** 투두 로드 대기 */
const waitForTodoLoad = async () => {
  await waitFor(
    () => {
      expect(screen.getByText("할일 1")).toBeInTheDocument();
    },
    { timeout: WAIT_TIMEOUT }
  );
};

/** 삭제 버튼 찾기 */
const findDeleteButton = () =>
  screen.getByRole("button", { name: /delete-selected-button/ });

/** 전체 선택 체크박스 찾기 */
const findAllCheckbox = () =>
  screen.getByRole("checkbox", { name: /select-all/ });

describe("TodoComponent", () => {
  const mockFetch = setupMocks();
  let component: RenderResult;

  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockImplementation((url: string, options?: RequestInit) => {
      if (url === "/api/todos" && !options) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: createMockTodos(TEST_TODO_COUNT),
            }),
        });
      } else if (url.startsWith("/api/todos/") && options?.method === "DELETE") {
        return Promise.resolve({ ok: true });
      } else if (url.startsWith("/api/todos/") && options?.method === "PUT") {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({ ok: true });
    });

    // 컴포넌트를 beforeEach에서 한 번만 렌더링
    component = render(
      <TodoProvider>
        <TodoComponent />
      </TodoProvider>
    );
  });

  describe("기본 기능", () => {
    it("컴포넌트가 정상적으로 렌더링되는가", async () => {
      await waitFor(() => {
        expect(findDeleteButton()).toBeInTheDocument();
      }, { timeout: WAIT_TIMEOUT });
    });

    it("검색어 입력 시 할일 목록이 필터링되는가", async () => {
      await waitForTodoLoad();

      await act(async () => {
        const searchInput = screen.getByPlaceholderText("검색");
        fireEvent.change(searchInput, { target: { value: "할일 1" } });
      });

      expect(screen.getByText("할일 1")).toBeInTheDocument();
      expect(screen.queryByText("할일 2")).not.toBeInTheDocument();
    });
  });

  describe("할일 상태 관리", () => {
    it("할일 완료 상태를 변경할 수 있는가", async () => {
      await waitForTodoLoad();

      await act(async () => {
        const statusSwitch = screen.getAllByRole("switch")[0];
        fireEvent.click(statusSwitch);
      });

      await waitFor(() => {
        const updateCall = mockFetch.mock.calls.find(
          (call) =>
            call[0] === "/api/todos/1" &&
            call[1]?.method === "PUT" &&
            JSON.parse(call[1].body).done === true
        );
        expect(updateCall).toBeTruthy();
      }, { timeout: WAIT_TIMEOUT });
    });

    it("개별 할일을 수정할 수 있는가", async () => {
      await waitForTodoLoad();

      const editButtons = screen.getAllByRole("button", { name: /edit-button/ });
      fireEvent.click(editButtons[0]);

      const inputs = screen.getAllByDisplayValue("할일 1");
      const editInput = inputs.find(
        (input) => input.getAttribute("type") === "text"
      );
      expect(editInput).toBeTruthy();
      fireEvent.change(editInput!, { target: { value: "수정된 할일" } });

      const saveButtons = screen.getAllByRole("button", { name: /save-button/ });
      fireEvent.click(saveButtons[0]);

      await waitFor(() => {
        const updateCall = mockFetch.mock.calls.find(
          (call) =>
            call[0] === "/api/todos/1" &&
            call[1]?.method === "PUT" &&
            JSON.parse(call[1].body).text === "수정된 할일"
        );
        expect(updateCall).toBeTruthy();
      }, { timeout: WAIT_TIMEOUT });
    });
  });

  describe("할일 삭제", () => {
    it("개별 할일을 삭제할 수 있는가", async () => {
      await waitForTodoLoad();

      const deleteButtons = screen.getAllByRole("button", {
        name: /delete-button/,
      });
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        const deleteCall = mockFetch.mock.calls.find(
          (call) =>
            call[0].startsWith("/api/todos/") && call[1]?.method === "DELETE"
        );
        expect(deleteCall).toBeTruthy();
      }, { timeout: WAIT_TIMEOUT });
    });

    it("선택된 항목이 없을 때 삭제 버튼이 비활성화되는가", async () => {
      await waitFor(() => {
        expect(findDeleteButton()).toBeDisabled();
      }, { timeout: WAIT_TIMEOUT });
    });

    it("선택된 항목이 있을 때 삭제 버튼이 활성화되어야 합니다", async () => {
      await waitForTodoLoad();

      fireEvent.click(findAllCheckbox());

      await waitFor(() => {
        expect(findDeleteButton()).not.toBeDisabled();
      }, { timeout: WAIT_TIMEOUT });
    });

    it("삭제 버튼 클릭 시 선택된 항목들이 삭제되어야 합니다", async () => {
      await waitForTodoLoad();
      const checkboxes = screen.getAllByRole("checkbox", { name: /select-item/ });

      fireEvent.click(findAllCheckbox());
      fireEvent.click(findDeleteButton());

      await waitFor(() => {
        const deleteCalls = mockFetch.mock.calls.filter(
          (call) =>
            call[0].startsWith("/api/todos/") && call[1]?.method === "DELETE"
        );
        expect(deleteCalls.length).toBe(checkboxes.length);
      }, { timeout: WAIT_TIMEOUT });
    });
  });

  describe("추가 기능", () => {
    it("무한 스크롤 모드로 전환하고 스크롤할 수 있는가", async () => {
      await waitForTodoLoad();

      fireEvent.click(screen.getByText("무한 스크롤"));

      const scrollContainer = document.getElementById("scrollableDiv");
      fireEvent.scroll(scrollContainer!, { target: { scrollTop: 1000 } });

      expect(mockFetch).toHaveBeenCalledWith("/api/todos");
    });

    it("할일을 추가할 수 있는가", async () => {
      const input = screen.getByPlaceholderText("새로운 할일");
      fireEvent.change(input, { target: { value: "새로운 할일 TEST" } });

      const addButton = screen.getByText("추가");
      fireEvent.click(addButton);

      await waitFor(() => {
        const createCall = mockFetch.mock.calls.find(
          (call) =>
            call[0] === "/api/todos" &&
            call[1]?.method === "POST" &&
            JSON.parse(call[1].body).text === "새로운 할일 TEST"
        );
        expect(createCall).toBeTruthy();
      }, { timeout: WAIT_TIMEOUT });
    });
  });
});
