import "@testing-library/jest-dom";
import { afterEach, beforeAll, beforeEach, vi } from "vitest";

beforeAll(() => {
  location.href = "http://localhost:3001";
});
beforeEach(async () => {});
afterEach(() => {
  vi.useRealTimers();
});
