export interface ITodo {
  id: number;
  title: string;
  completed: boolean;
}

export enum EventType {
  CreatedEventType = "Created",
  UpdateEventType = "Updated",
  DeleteEventType = "Deleted",
};

export interface WsEvent {
  type: EventType;
  data: string;
}