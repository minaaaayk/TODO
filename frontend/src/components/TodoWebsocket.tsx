import React from 'react'
import { UseTodoWebsocket } from '../hooks/UseTodoWebsocket';
import { TodoList } from './TodoList';
import { useTodoStore } from '../store/Todo';

interface IProps {
    version: number;
}

export const TodoWebsocket: React.FC<IProps> = ({ version }) => {
    const { connectionStatus } = UseTodoWebsocket(version);
    const todos = useTodoStore((state) => state.todos);
    return (
       <>
            state: {connectionStatus}
            <TodoList todos={todos} />
       </>
    )
}
