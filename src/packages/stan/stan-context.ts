import { BaseRpcContext } from '@nestjs/microservices/ctx-host/base-rpc.context';
import { Message, Subscription } from 'node-nats-streaming';

type StanContextArgs = [Message, Subscription];

export class StanContext extends BaseRpcContext<StanContextArgs> {
    getMessage(): Message {
        return this.args[0];
    }

    getSubscription(): Subscription {
        return this.args[1];
    }
}
