import { Deserializer, Serializer } from '@nestjs/microservices';
import { Message, StanOptions, SubscriptionOptions } from 'node-nats-streaming';

export interface StanProviderOptions {
    clusterID: string;
    clientID: string;
    stanOptions?: StanOptions;
    serializer?: Serializer;
    deserializer?: Deserializer;
}

export interface StanSubscriber {
    subject: string;
    group?: string;
    disableAutoAck?: boolean;
    deserializer?: (message: Message) => any;
    options?: (v: SubscriptionOptions) => void;
}