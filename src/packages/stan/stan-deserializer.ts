import { Deserializer } from '@nestjs/microservices';
import { Message } from 'node-nats-streaming';

export class StanDeserializer implements Deserializer {
    deserialize(value: Message) {
        const data = JSON.parse(value.getData() as string);
        return { pattern: value.getSubject(), data };
    }
}
