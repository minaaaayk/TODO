import { create } from 'zustand'
import { ITodo } from '../Types/todo';
import { fetchTodos } from '../api/todo';


interface TodoState {
    todos: ITodo[];
    currentVersion: number;
    lastVersion: number;
    loading: boolean;
    error: boolean;
    fetchTodos: () => Promise<void>;
    setError: (error: boolean) => void;
    addTodo: (todo: ITodo, version: number) => void;
    toggleTodo: (todo: ITodo, version: number) => void;
    deleteTodo: (todo: ITodo, version: number) => void;
    updateLastVersion: (version: number) => void;
}

export const useTodoStore = create<TodoState>((set, get) => ({
    todos: [],
    currentVersion: 0,
    lastVersion: 0,
    loading: true,
    error: false,
    fetchTodos: async () => {
        try {
            const { items, version } = await fetchTodos();
            set({ todos: items, currentVersion: version });
            set({ loading: false });
        } catch (err) {
            set({ error: true });
            console.error("Failed to fetch users");
        }
    },
    addTodo: (todo: ITodo, version: number) => {
        set((state) => ({ todos: [...state.todos, todo] }));
        get().updateLastVersion(version);
    },
    toggleTodo: (todo: ITodo, version: number) => {
        set((state) => ({ todos: state.todos.map(item => item.id === todo.id ? todo : item) }));
        get().updateLastVersion(version);
    },
    deleteTodo: (todo: ITodo, version: number) => {
        set((state) => ({ todos: state.todos.filter(item => item.id !== todo.id) }));
        get().updateLastVersion(version);
    },
    updateLastVersion: (version: number) => {
        set((state) => ({
            lastVersion: state.lastVersion < version ? version : state.lastVersion,
        }));
    },
    setError: (error: boolean) => {
        set({error});
    },
}));