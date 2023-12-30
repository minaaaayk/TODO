// main.go
package main

import (
	"encoding/json"
	"fmt"
	types "main/Types"
	"main/queue"
	"net/http"
	"strconv"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

type EventType string

var tasks = []types.Task{
	{ID: 1, Title: "Task 1", Completed: false},
	{ID: 2, Title: "Task 2", Completed: true},
}

var c = make(chan types.Event)

func getAllTodos(w http.ResponseWriter, _ *http.Request) {
	json.NewEncoder(w).Encode(tasks)
}

func createTodo(w http.ResponseWriter, r *http.Request) {
	var newTask types.Task
	_ = json.NewDecoder(r.Body).Decode(&newTask)
	c <- types.Event{Type: types.CreatedEventType, Data: newTask}
	tasks = append(tasks, newTask)
	json.NewEncoder(w).Encode(newTask)
}

func deleteTodo(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	taskID, _ := strconv.Atoi(params["id"])
	for index, task := range tasks {
		if task.ID == taskID {
			c <- types.Event{Type: types.DeleteEventType, Data: task}
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
			c <- types.Event{Type: types.UpdateEventType, Data: tasks[index]}
			break
		}
	}
	json.NewEncoder(w).Encode(tasks)
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}
var clients = make(map[*websocket.Conn]bool)
var q = queue.New(50)

func broadcast(message types.Event) {
	for client := range clients {
		if err := client.WriteJSON(message); err != nil {
			fmt.Println("error:", err)
			client.Close()
			delete(clients, client)
		}
	}
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	// Upgrade the HTTP connection to a WebSocket connection
	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		fmt.Println("Error during connection upgradation:", err)
		return
	}
	clients[conn] = true
	defer conn.Close()

	go func() {
		for msg1 := range c {
			broadcast(msg1)
		}
	}()

	// The event loop
	for {
		messageType, message, err := conn.ReadMessage()
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

	q.Enqueue(1)
	q.Enqueue(2)
	q.Enqueue(3)
	fmt.Println(q.Size()) // Outputs: 3
	q.Enqueue(4)
	fmt.Println(q.Size()) // Outputs: 3
	q.Dequeue()
	fmt.Println(q.Size()) // Outputs: 2
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
