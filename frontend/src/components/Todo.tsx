import React from "react";
import { TodoForm } from "./TodoForm";
import { useEffectOnce } from "../hooks/useEffectOnce";
import { useTodoStore } from "../store/Todo";
import { TodoWebsocket } from "./TodoWebsocket";

export const Todo: React.FC = () => {

    const error = useTodoStore((state) => state.error);
    const loading = useTodoStore((state) => state.loading);
    const currentVersion = useTodoStore((state) => state.currentVersion);
    const fetchTodos = useTodoStore((state) => state.fetchTodos);
    useEffectOnce(() => {
        fetchTodos();
    });

    return (
        <>
            <TodoForm />
            { (!error && !loading) && <TodoWebsocket version={currentVersion}/>}
        </>
    );
};

