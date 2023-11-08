import React, { useState } from "react";
import { ITodo, WsEvent } from "./types";
import { TodoForm } from "./TodoForm";
import { TodoList } from "./TodoList";
import axios from "axios";
import useWebSocket,{ ReadyState }  from 'react-use-websocket';
import { useEffectOnce } from "../hooks/useEffectOnce";

export const Todo: React.FC = () => {
  const [todos, setTodos] = useState<ITodo[]>([]);
  const baseUrl = 'http://127.0.0.1:8000';
  const socketUrl = 'ws://localhost:8000/ws';
  const { readyState } = useWebSocket(socketUrl, {
   onMessage: (event) => handleWS(event as WsEvent),
   shouldReconnect: (closeEvent) => true,
 });


  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  useEffectOnce(() => {
    fetchTodos();
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
    await axios.delete(`${baseUrl}/todos/${id}`);
    // setTodos(todos.filter(todo => todo.id !== id));
  };


  const toggleTodo = async (id: number) => {
    await axios.put(`${baseUrl}/todos/${id}/toggle`);
    // setTodos(todos.map(todo => todo.id === id ? {...todo, completed: !todo.completed} : todo));
  };

  const handleWS = (event : WsEvent) => {
        console.log("Received:", JSON.parse(event.data));
        const {type, data} = JSON.parse(event.data);
        switch (type) {
          case 'Created':
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


  return (
    <>
      { connectionStatus }
      <TodoForm addTodo={addTodo} />
      <TodoList todos={todos} deleteTodo={deleteTodo} toggleTodo={toggleTodo} />
    </>
  );
};

