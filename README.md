# notification-ms

This project helped me understand how microservices can communicate asynchronously using RabbitMQ instead of calling each other directly.

## What I Learned

- RabbitMQ works well for microservice communication when services should stay loosely coupled.
- In a pub-sub style flow, one service publishes an event or message and another service consumes it independently.
- The producer and consumer do not need to be active at the exact same time, because the queue can hold messages.
- A consumer should connect to RabbitMQ, create a channel, assert the queue, and then start listening for messages.
- Using durable queues helps messages survive broker restarts.
- Manual acknowledgements are safer than `noAck: true` because the consumer confirms the message only after successful processing.
- `prefetch(1)` helps control message delivery so the consumer handles one message at a time.
- Graceful shutdown is important in message-based systems so RabbitMQ connections and channels close cleanly.

## Pub-Sub In This Service

- A publisher service can send a notification message to RabbitMQ.
- This notification microservice acts as a subscriber/consumer and receives the message from the queue.
- Once the message is received, the service can process it without tightly depending on the publisher service.

## Why This Matters

- It improves scalability because services can work independently.
- It improves reliability because temporary service downtime does not always lose messages.
- It makes the system easier to extend because new consumers can be added later for different tasks.
