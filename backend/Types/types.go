package types

type EventType string

const (
	CreatedEventType EventType = "Created"
	UpdateEventType  EventType = "Updated"
	DeleteEventType  EventType = "Deleted"
)

type Event struct {
	Type EventType   `json:"type"`
	Data interface{} `json:"data"`
}

type Task struct {
	ID        int    `json:"id"`
	Title     string `json:"title"`
	Completed bool   `json:"completed"`
}
