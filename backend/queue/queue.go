package queue

import (
	"errors"
	types "main/Types"
)

type Queue struct {
	items []types.Event
	limit int
}

func New(limit int) *Queue {
	return &Queue{
		items: make([]types.Event, 0),
		limit: limit,
	}
}

func (q *Queue) Enqueue(item types.Event) error {
	if len(q.items) >= q.limit {
		q.Dequeue() // Remove the item from the front of the queue if it's full
	}
	q.items = append(q.items, item)
	return nil
}

func (q *Queue) Dequeue() (types.Event, error) {
	if len(q.items) == 0 {
		return types.Event{Type: "", Data: nil, Version: 0}, errors.New("queue is empty")
	}
	item := q.items[0]
	q.items = q.items[1:]
	return item, nil
}

func (q *Queue) Size() int {
	return len(q.items)
}

func (q *Queue) GetItem(index int) (types.Event, error) {
	if len(q.items) == 0 {
		return types.Event{Type: "", Data: nil, Version: 0}, errors.New("queue is empty")
	}
	if index > (len(q.items) - 1) {
		return types.Event{Type: "", Data: nil, Version: 0}, errors.New("index not found")
	}
	return q.items[index], nil
}
