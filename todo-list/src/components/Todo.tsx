import React, { useState } from "react";
import { ITodo } from "./types";
import { TodoForm } from "./TodoForm";
import { TodoList } from "./TodoList";
import axios from "axios";
import { useEffectOnce } from "../hooks/useEffectOnce";

export const Todo: React.FC = () => {
  const [todos, setTodos] = useState<ITodo[]>([]);
    const baseUrl = 'http://127.0.0.1:8000';

  useEffectOnce(() => {
    fetchTodos();
    const socket = new WebSocket("ws://localhost:8000/ws");
    socket.onmessage = function(event) {
        console.log("Received:", JSON.parse(event.data));
        const {type, data} = JSON.parse(event.data);
        switch (type) {
          case 'Created':
            console.log('data:', data);
            
            setTodos([...todos, data]);
            break;
            case 'Updated':
            setTodos(todos.map(todo => todo.id === data.id ? data : todo));
            
            break;
            case 'Deleted':
              setTodos(todos.filter(todo => todo.id !== data.id));
            
            break;
        
          default:
            break;
        }
    };
   
  });

  const fetchTodos = async () => {
    const response = await axios.get<ITodo[]>(`${baseUrl}/todos`);
    setTodos(response.data);
  };

  const addTodo = async (title: string) => {
    // const response = 
    await axios.post<ITodo>(`${baseUrl}/todos`, { title, completed: false, id: Math.floor((Math.random() * 10000) + 1) });    
    // setTodos([...todos, response.data]);
  };

  const deleteTodo = async (id: number) => {
    // await axios.delete(`${baseUrl}/todos/${id}`);
    // setTodos(todos.filter(todo => todo.id !== id));
  };


  const toggleTodo = async (id: number) => {
    await axios.put(`${baseUrl}/todos/${id}/toggle`);
    // setTodos(todos.map(todo => todo.id === id ? {...todo, completed: !todo.completed} : todo));
  };



  return (
    <>
      <TodoForm addTodo={addTodo} />
      <TodoList todos={todos} deleteTodo={deleteTodo} toggleTodo={toggleTodo} />
    </>
  );
};

