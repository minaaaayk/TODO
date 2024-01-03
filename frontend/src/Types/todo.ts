export interface ITodo {
    id: number;
    title: string;
    completed: boolean;
}

export enum EventType {
    CreatedType = "Created",
    UpdateType = "Updated",
    DeleteType = "Deleted",
    ErrorType = "Error",
};

export interface WsEvent {
    type: EventType;
    data: any;
    version: number,
}