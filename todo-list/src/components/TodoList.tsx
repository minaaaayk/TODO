import { ITodo } from "./types";

interface TodoListProps {
  todos: ITodo[];
  deleteTodo: (id: number) => void;
  toggleTodo: (id: number) => void;
}

export const TodoList: React.FC<TodoListProps> = ({ todos, deleteTodo, toggleTodo }) => {
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
