import express from 'express';
import dotenv from 'dotenv';
import amqp from 'amqplib';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = process.env.QUEUE_NAME || 'notifications';

let connection;
let channel;

const receivingMessage = async () => {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, {
        durable: true,
        arguments: {
            'x-queue-type': 'quorum'
        }
    });

    await channel.prefetch(1);

    await channel.consume(QUEUE_NAME, async (msg) => {
        if (!msg) {
            return;
        }

        try {
            const content = msg.content.toString();
            console.log(' [x] Received %s', content);

            channel.ack(msg);
        } catch (error) {
            console.error('Failed to process message:', error);
            channel.nack(msg, false, true);
        }
    });

    console.log(`Waiting for messages in queue "${QUEUE_NAME}"`);
};

const closeRabbitMq = async () => {
    try {
        if (channel) {
            await channel.close();
        }

        if (connection) {
            await connection.close();
        }
    } catch (error) {
        console.error('Error while closing RabbitMQ connection:', error);
    }
};

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Notification Microservice is running!');
});

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);

    try {
        await receivingMessage();
    } catch (error) {
        console.error('Unable to start RabbitMQ consumer:', error);
        process.exit(1);
    }
});

process.on('SIGINT', async () => {
    await closeRabbitMq();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await closeRabbitMq();
    process.exit(0);
});
