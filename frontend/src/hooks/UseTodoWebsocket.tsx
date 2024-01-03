import useWebSocket, { ReadyState } from "react-use-websocket";
import { useTodoStore } from "../store/Todo";
import { EventType, ITodo, WsEvent } from "../Types/todo";

export const UseTodoWebsocket = (version: number) => {

    const addTodo = useTodoStore((state) => state.addTodo);
    const toggleTodo = useTodoStore((state) => state.toggleTodo);
    const deleteTodo = useTodoStore((state) => state.deleteTodo);
    const setError = useTodoStore((state) => state.setError);

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
        const { type, data, version } = JSON.parse(event.data) as WsEvent;
        switch (type) {
            case EventType.CreatedType:
                addTodo(data as ITodo, version);
                break;

            case EventType.UpdateType:
                toggleTodo(data, version);
                break;

            case EventType.DeleteType:
                deleteTodo(data, version);
                break;
            case EventType.ErrorType:
                console.log('error: ',data, version );
                setError(true)
                // TODO: add change version
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