import { deleteTodo, toggleTodo } from "../api/todo";
import { ITodo } from "./types";

interface TodoListProps {
  todos: ITodo[];
}

export const TodoList: React.FC<TodoListProps> = ({ todos}) => {
  return (
    <ul>
      {todos.map(({id, title, completed}) => (
        <li key={id}>
            <input type="checkbox" checked={completed} onChange={(e) => toggleTodo(id)}/>
          {title}
          <button onClick={() => deleteTodo(id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
};
