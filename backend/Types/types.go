package types

type EventType string

const (
	CreatedEventType EventType = "Created"
	UpdateEventType  EventType = "Updated"
	DeleteEventType  EventType = "Deleted"
)

type Event struct {
	Type    EventType   `json:"type"`
	Data    interface{} `json:"data"`
	Version int         `json:"version"`
}

type Error struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}
type Task struct {
	ID        int    `json:"id"`
	Title     string `json:"title"`
	Completed bool   `json:"completed"`
}

type AllTask struct {
	Items   []Task `json:"items"`
	Version int    `json:"version"`
}
