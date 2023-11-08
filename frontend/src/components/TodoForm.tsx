import { useState } from "react";
import { addTodo } from "../api/todo";


export const TodoForm: React.FC = () => {
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addTodo(title);
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} />
      <button type="submit">Add Todo</button>
    </form>
  );
};