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
var clients = make(map[*websocket.Conn]int)
var q = queue.New(50)
var version int

func getAllTodos(w http.ResponseWriter, _ *http.Request) {
	json.NewEncoder(w).Encode(types.AllTask{Items: tasks, Version: version})
}

func createTodo(w http.ResponseWriter, r *http.Request) {
	var newTask types.Task
	version++
	_ = json.NewDecoder(r.Body).Decode(&newTask)
	newEvent := types.Event{Type: types.CreatedEventType, Data: newTask, Version: version}
	q.Enqueue(newEvent)
	c <- newEvent
	tasks = append(tasks, newTask)
	json.NewEncoder(w).Encode(newTask)
}

func deleteTodo(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	taskID, _ := strconv.Atoi(params["id"])
	for index, task := range tasks {
		if task.ID == taskID {
			version++
			newEvent := types.Event{Type: types.DeleteEventType, Data: task, Version: version}
			q.Enqueue(newEvent)
			c <- newEvent
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
			version++
			tasks[index].Completed = !tasks[index].Completed
			newEvent := types.Event{Type: types.UpdateEventType, Data: tasks[index], Version: version}
			q.Enqueue(newEvent)
			c <- newEvent
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

func checkDeprecation(client *websocket.Conn, clientVersion int) bool {
	if frontItem, err := q.GetItem(0); err == nil && frontItem.Version > clientVersion+1 {
		errorData := types.Error{Code: 410, Message: "deprecated"}
		client.WriteJSON(types.Event{Type: types.ErrorEventType, Data: errorData, Version: version - 1})
		fmt.Println("410 error:")
		client.Close()
		return true
	} else {
		return false
	}
}

func sendRemaining(client *websocket.Conn, clientVersion int) {
	for i := 0; i <= q.Size(); i++ {
		if item, err := q.GetItem(i); err == nil && item.Version > clientVersion {
			if err := client.WriteJSON(item); err != nil {
				fmt.Println("error:", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}

func broadcast(message types.Event) {
	for client, clientVersion := range clients {
		if !checkDeprecation(client, clientVersion) {
			if err := client.WriteJSON(message); err != nil {
				fmt.Println("error:", err)
				client.Close()
				delete(clients, client)
			}
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

	params := mux.Vars(r)
	if currentVersion, err := strconv.Atoi(params["version"]); err != nil {
		clients[conn] = version
	} else {
		if checkDeprecation(conn, currentVersion) {
			fmt.Println("Error connection version:")
			conn.Close()
			return
		}
		clients[conn] = currentVersion
	}
	// add logic
	sendRemaining(conn, clients[conn])

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
	version = 0
	router := mux.NewRouter()
	router.HandleFunc("/todos", getAllTodos).Methods("GET")
	router.HandleFunc("/todos", createTodo).Methods("POST")
	router.HandleFunc("/todos/{id}", deleteTodo).Methods("DELETE")
	router.HandleFunc("/todos/{id}/toggle", toggleTodo).Methods("PUT")
	router.HandleFunc("/ws/{version}", wsHandler)
	router.HandleFunc("/ws", wsHandler)

	allowedOrigins := handlers.AllowedOrigins([]string{"*"})
	allowedMethods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})
	allowedHeaders := handlers.AllowedHeaders([]string{"Content-Type", "Authorization"})

	http.ListenAndServe(":8000", handlers.CORS(allowedOrigins, allowedMethods, allowedHeaders)(router))
}
