// main.go
package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

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

var tasks = []Task{
	{ID: 1, Title: "Task 1", Completed: false},
	{ID: 2, Title: "Task 2", Completed: true},
}

var c = make(chan Event)

func getAllTodos(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(tasks)
}

func createTodo(w http.ResponseWriter, r *http.Request) {
	var newTask Task
	_ = json.NewDecoder(r.Body).Decode(&newTask)
	c <- Event{Type: CreatedEventType, Data: newTask}
	tasks = append(tasks, newTask)
	json.NewEncoder(w).Encode(newTask)
}

func deleteTodo(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	taskID, _ := strconv.Atoi(params["id"])
	for index, task := range tasks {
		if task.ID == taskID {
			c <- Event{Type: DeleteEventType, Data: task}
			tasks = append(tasks[:index], tasks[index+1:]...)
			break
		}
	}
	json.NewEncoder(w).Encode(tasks)
}

func toggleTodo(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	taskID, _ := strconv.Atoi(params["id"])
	for index, task := range tasks {
		if task.ID == taskID {
			tasks[index].Completed = !tasks[index].Completed
			c <- Event{Type: UpdateEventType, Data: tasks[index]}
			break
		}
	}
	json.NewEncoder(w).Encode(tasks)
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	// Upgrade the HTTP connection to a WebSocket connection
	conn, err := upgrader.Upgrade(w, r, nil)
	fmt.Println("ddddddddddd")

	if err != nil {
		fmt.Println("Error during connection upgradation:", err)
		return
	}
	defer conn.Close()

	fmt.Println("ffff")
	go func() {
		for msg1 := range c {
			fmt.Println("msg1:", msg1)
			conn.WriteJSON(msg1)
		}
	}()

	// The event loop
	for {
		fmt.Println("kkkk")
		messageType, message, err := conn.ReadMessage()
		fmt.Println("fggggg")
		if err != nil {
			fmt.Println("Error during message reading:", err)
			break
		}
		fmt.Printf("Received: %s", message)
		err = conn.WriteMessage(messageType, message)
		if err != nil {
			fmt.Println("Error during message writing:", err)
			break
		}
	}
}

func main() {
	router := mux.NewRouter()
	router.HandleFunc("/todos", getAllTodos).Methods("GET")
	router.HandleFunc("/todos", createTodo).Methods("POST")
	router.HandleFunc("/todos/{id}", deleteTodo).Methods("DELETE")
	router.HandleFunc("/todos/{id}/toggle", toggleTodo).Methods("PUT")
	router.HandleFunc("/ws", wsHandler)

	allowedOrigins := handlers.AllowedOrigins([]string{"*"})
	allowedMethods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})
	allowedHeaders := handlers.AllowedHeaders([]string{"Content-Type", "Authorization"})

	http.ListenAndServe(":8000", handlers.CORS(allowedOrigins, allowedMethods, allowedHeaders)(router))
}
