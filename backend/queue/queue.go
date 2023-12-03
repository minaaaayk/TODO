package queue

import "errors"

type Queue struct {
	items []int
	limit int
}

func New(limit int) *Queue {
	return &Queue{
		items: make([]int, 0),
		limit: limit,
	}
}

func (q *Queue) Enqueue(item int) error {
	if len(q.items) >= q.limit {
		q.Dequeue() // Remove the item from the front of the queue if it's full
	}
	q.items = append(q.items, item)
	return nil
}

func (q *Queue) Dequeue() (int, error) {
	if len(q.items) == 0 {
		return 0, errors.New("queue is empty")
	}
	item := q.items[0]
	q.items = q.items[1:]
	return item, nil
}

func (q *Queue) Size() int {
	return len(q.items)
}
