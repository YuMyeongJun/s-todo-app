import { TodoProvider } from "./contexts/TodoContext";
import TodoComponent from "./components/todo/TodoComponent";

function App() {
  return (
    <TodoProvider>
      <TodoComponent />
    </TodoProvider>
  );
}

export default App;
