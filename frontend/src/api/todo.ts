

import axios from "axios";
import { ITodo } from "../components/types";

const baseUrl = 'http://127.0.0.1:8000';

export const fetchTodos = async () => {
    const response = await axios.get<ITodo[]>(`${baseUrl}/todos`);
    return (response.data);
};

export const addTodo = async (title: string) => {
    await axios.post<ITodo>(`${baseUrl}/todos`, { title, completed: false, id: Math.floor((Math.random() * 10000) + 1) });   
};

export const deleteTodo = async (id: number) => {
    await axios.delete(`${baseUrl}/todos/${id}`);
};


export const toggleTodo = async (id: number) => {
    await axios.put(`${baseUrl}/todos/${id}/toggle`);
};