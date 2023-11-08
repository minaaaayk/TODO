import React, { useState } from "react";
import { ITodo, WsEvent } from "./types";
import { TodoForm } from "./TodoForm";
import { TodoList } from "./TodoList";
import useWebSocket,{ ReadyState }  from 'react-use-websocket';
import { useEffectOnce } from "../hooks/useEffectOnce";
import { fetchTodos } from "../api/todo";

export const Todo: React.FC = () => {
  const [todos, setTodos] = useState<ITodo[]>([]);
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
    getAllTodo();
  });

  const getAllTodo = async () => {
    const response = await fetchTodos()
    setTodos(response);
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
      <TodoForm />
      <TodoList todos={todos} />
    </>
  );
};

