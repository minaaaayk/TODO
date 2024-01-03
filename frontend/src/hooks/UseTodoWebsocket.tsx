import useWebSocket, { ReadyState } from "react-use-websocket";
import { useTodoStore } from "../store/Todo";

export const UseTodoWebsocket = (version: number) => {

    const addTodo = useTodoStore((state) => state.addTodo);
    const toggleTodo = useTodoStore((state) => state.toggleTodo);
    const deleteTodo = useTodoStore((state) => state.deleteTodo);

    const url = `ws://localhost:8000/ws/${version}`;
    const ws = useWebSocket(url, {
        onMessage: (event) => handleWS(event),
        shouldReconnect: (closeEvent) => true,
    });
    const { readyState } = ws;
    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    const handleWS = (event: MessageEvent) => {
        console.log("Received:", JSON.parse(event.data));
        const { type, data, version } = JSON.parse(event.data);
        switch (type) {
            case 'Created':
                addTodo(data, version);
                break;

            case 'Updated':
                toggleTodo(data, version);
                break;

            case 'Deleted':
                deleteTodo(data, version);
                break;

            default:
                break;
        }
    };

    return {
        ...ws,
        connectionStatus,
    }
};