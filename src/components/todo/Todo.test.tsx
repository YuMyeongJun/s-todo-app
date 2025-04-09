/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TodoComponent from "./TodoComponent";
import { TodoProvider } from "../../contexts/TodoContext";

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockImplementation(() => ({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
}));

window.IntersectionObserver = mockIntersectionObserver;

// Mock fetch
const mockFetch = vi.fn();
(window as any).fetch = mockFetch;

describe("TodoComponent", () => {
  beforeEach(() => {
    // Reset mocks
    mockFetch.mockReset();

    // Mock API response with default data
    mockFetch.mockImplementation((url: string, options?: RequestInit) => {
      console.log(options);
      if (url === "/api/todos" && !options) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: Array.from({ length: 15 }, (_, i) => ({
                id: i + 1,
                text: `할일 ${i + 1}`,
                done: false,
                deadline: Date.now() + 86400000,
              })),
            }),
        });
      } else if (
        url.startsWith("/api/todos/") &&
        options?.method === "DELETE"
      ) {
        return Promise.resolve({ ok: true });
      } else if (url.startsWith("/api/todos/") && options?.method === "PUT") {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({ ok: true });
    });
  });

  const renderComponent = () => {
    return render(
      <TodoProvider>
        <TodoComponent />
      </TodoProvider>
    );
  };

  it("컴포넌트가 정상적으로 렌더링되는가", async () => {
    renderComponent();
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /delete-selected-button/ })
      ).toBeInTheDocument();
    });
  });

  it("검색어 입력 시 할일 목록이 필터링되는가", async () => {
    renderComponent();

    // 할일 목록이 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText("할일 1")).toBeInTheDocument();
    });

    // 검색어 입력
    await act(async () => {
      const searchInput = screen.getByPlaceholderText("검색");
      fireEvent.change(searchInput, { target: { value: "할일 1" } });
    });

    // 검색 결과 확인
    expect(screen.getByText("할일 1")).toBeInTheDocument();
    expect(screen.queryByText("할일 2")).not.toBeInTheDocument();
  });

  it("할일 완료 상태를 변경할 수 있는가", async () => {
    renderComponent();

    // 할일 목록이 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText("할일 1")).toBeInTheDocument();
    });

    // 첫 번째 할일의 완료 상태 변경
    await act(async () => {
      const statusSwitch = screen.getAllByRole("switch")[0];
      fireEvent.click(statusSwitch);
    });

    // API 호출 확인
    await waitFor(() => {
      const calls = mockFetch.mock.calls;
      const updateCall = calls.find(
        (call) =>
          call[0] === "/api/todos/1" &&
          call[1]?.method === "PUT" &&
          JSON.parse(call[1].body).done === true
      );
      expect(updateCall).toBeTruthy();
    });
  });

  it("개별 할일을 수정할 수 있는가", async () => {
    renderComponent();

    // 할일 목록이 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText("할일 1")).toBeInTheDocument();
    });

    // 수정 버튼 클릭
    const editButtons = screen.getAllByRole("button", { name: /edit-button/ });
    const firstEditButton = editButtons[0]; // 첫 번째 버튼 선택
    fireEvent.click(firstEditButton);

    // 수정된 텍스트 입력
    const inputs = screen.getAllByDisplayValue("할일 1");
    const editInput = inputs.find(
      (input) => input.getAttribute("type") === "text"
    );
    expect(editInput).toBeTruthy();
    fireEvent.change(editInput!, { target: { value: "수정된 할일" } });

    // 저장 버튼 클릭
    const saveButtons = screen.getAllByRole("button", { name: /save-button/ });
    const firstSaveButton = saveButtons[0]; // 첫 번째 버튼 선택
    fireEvent.click(firstSaveButton);

    // API 호출 확인
    await waitFor(() => {
      const updateCall = mockFetch.mock.calls.find(
        (call) =>
          call[0] === "/api/todos/1" &&
          call[1]?.method === "PUT" &&
          JSON.parse(call[1].body).text === "수정된 할일"
      );
      expect(updateCall).toBeTruthy();
    });
  });

  it("개별 할일을 삭제할 수 있는가", async () => {
    renderComponent();

    // 할일 목록이 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText("할일 1")).toBeInTheDocument();
    });

    // 삭제 버튼 클릭
    const deleteButtons = screen.getAllByRole("button", {
      name: /delete-button/,
    });
    const firstDeleteButton = deleteButtons[0]; // 첫 번째 버튼 선택
    fireEvent.click(firstDeleteButton);

    // API 호출 확인
    await waitFor(() => {
      const deleteCall = mockFetch.mock.calls.find(
        (call) =>
          call[0].startsWith("/api/todos/") && call[1]?.method === "DELETE"
      );
      expect(deleteCall).toBeTruthy();
    });
  });

  it("선택된 항목이 없을 때 삭제 버튼이 비활성화되는가", async () => {
    renderComponent();
    await waitFor(() => {
      const deleteButton = screen.getByRole("button", {
        name: /delete-selected-button/,
      });
      expect(deleteButton).toBeDisabled();
    });
  });

  it("선택된 항목이 있을 때 삭제 버튼이 활성화되어야 합니다", async () => {
    renderComponent();

    // 할일 목록이 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText("할일 1")).toBeInTheDocument();
    });

    // 전체 선택 체크박스 클릭
    const allCheckbox = screen.getByRole("checkbox", { name: /select-all/ });
    fireEvent.click(allCheckbox);

    // 삭제 버튼이 활성화되었는지 확인
    await waitFor(() => {
      const deleteButton = screen.getByRole("button", {
        name: /delete-selected-button/,
      });
      expect(deleteButton).not.toBeDisabled();
    });
  });

  it("삭제 버튼 클릭 시 선택된 항목들이 삭제되어야 합니다", async () => {
    renderComponent();

    // 할일 목록이 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText("할일 1")).toBeInTheDocument();
    });

    // 체크박스 선택
    const checkboxes = screen
      .getAllByRole("checkbox", { name: /select-item/ })
      .slice(0, 2);
    await act(async () => {
      checkboxes.forEach((checkbox) => {
        fireEvent.click(checkbox);
      });
    });
    console.log(checkboxes);

    // 선택 삭제 버튼 클릭
    const deleteButton = screen.getByRole("button", {
      name: /delete-selected-button/,
    });
    fireEvent.click(deleteButton);

    // API 호출 확인
    await waitFor(() => {
      const calls = mockFetch.mock.calls;
      const deleteCall1 = calls.find(
        (call) =>
          call[0].startsWith("/api/todos/") && call[1]?.method === "DELETE"
      );
      const deleteCall2 = calls.find(
        (call) =>
          call[0].startsWith("/api/todos/") && call[1]?.method === "DELETE"
      );

      expect(deleteCall1).toBeTruthy();
      expect(deleteCall2).toBeTruthy();
    });
  });

  it("무한 스크롤 모드로 전환하고 스크롤할 수 있는가", async () => {
    renderComponent();

    // 할일 목록이 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText("할일 1")).toBeInTheDocument();
    });

    // 무한 스크롤 모드로 변경
    const infiniteScrollButton = screen.getByText("무한 스크롤");
    fireEvent.click(infiniteScrollButton);

    // 스크롤 이벤트 발생
    const scrollContainer = document.getElementById("scrollableDiv");
    fireEvent.scroll(scrollContainer!, { target: { scrollTop: 1000 } });

    expect(mockFetch).toHaveBeenCalledWith("/api/todos");
  });

  it("할일을 추가할 수 있는가", async () => {
    renderComponent();

    // 새로운 할일 입력
    const input = screen.getByPlaceholderText("새로운 할일");
    fireEvent.change(input, { target: { value: "새로운 할일 TEST" } });

    // 추가 버튼 클릭
    const addButton = screen.getByText("추가");
    fireEvent.click(addButton);

    // API 호출 확인
    await waitFor(() => {
      const calls = mockFetch.mock.calls;
      const createCall = calls.find(
        (call) =>
          call[0] === "/api/todos" &&
          call[1]?.method === "POST" &&
          JSON.parse(call[1].body).text === "새로운 할일 TEST"
      );
      expect(createCall).toBeTruthy();
    });
  });
});
