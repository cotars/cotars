import { StanProviderOptions, StanSubscriber } from './interfaces';
import { StanContext } from './stan-context';
import { StanDeserializer } from './stan-deserializer';
import { StanSerializer } from './stan-serializer';
import { EVENT_PATTERN_TRANSPORT } from '@cotars/core';
import { isFunction, isObject } from '@nestjs/common/utils/shared.utils';
import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';
import {
    CustomTransportStrategy,
    MessageHandler,
    Server,
    Transport
    } from '@nestjs/microservices';
import { CONNECT_EVENT, ERROR_EVENT } from '@nestjs/microservices/constants';
import {
    connect,
    Message,
    Stan,
    Subscription
    } from 'node-nats-streaming';
import { v4 } from 'uuid';
export class ServerStan extends Server implements CustomTransportStrategy {
    readonly transportId: Transport = EVENT_PATTERN_TRANSPORT;
    protected stanClient: Stan;
    protected connection: Promise<any>;
    protected subscriptions: Map<string, StanSubscriber> = new Map();

    constructor(protected options: StanProviderOptions) {
        super();
        this.initialize();
    }

    protected initialize() {
        this.options.serializer ||= new StanSerializer;
        this.options.deserializer ||= new StanDeserializer;
        this.initializeSerializer(this.options);
        this.initializeDeserializer(this.options);
    }

    protected createStan(): Stan {
        return connect(
            this.options.clusterID,
            this.options.clientID,
            this.options.stanOptions,
        );
    }

    protected handleError(client: any) {
        client.addListener(ERROR_EVENT, (err: Error) => this.logger.error(err));
    }

    async listen(callback: () => void) {
        if (this.stanClient) {
            return this.stanClient;
        }
        this.stanClient = this.createStan();
        this.handleError(this.stanClient);
        await this.start();
        callback && callback();
        this.bindEvents(this.stanClient);
        return this.stanClient;
    }

    protected start() {
        return new Promise((reslove) => {
            this.stanClient.on(CONNECT_EVENT, reslove);
        });
    }

    addHandler(
        pattern: StanSubscriber,
        callback: MessageHandler,
        isEventHandler?: boolean,
    ) {
        if (!isEventHandler) {
            throw new RuntimeException('stan only support event pattern');
        }
        if (!isObject(pattern) || !pattern.subject) {
            throw new RuntimeException('stan event pattern not support');
        }
        const uuid = v4();
        this.subscriptions.set(uuid, pattern);
        return super.addHandler(uuid, callback, isEventHandler);
    }

    public bindEvents(client: Stan) {
        const registeredPatterns = [...this.messageHandlers.keys()];
        
        registeredPatterns.forEach((pattern) =>
            this.subscribe(client, pattern),
        );
    }

    protected subscribe(client: Stan, pattern: string) {
        const options = client.subscriptionOptions();
        const subscriber = this.subscriptions.get(pattern);
        if (isFunction(subscriber.options)) {
            subscriber.options(options);
        }
        const { subject, group } = subscriber;
        this.logger.debug(`subscribe(${subject}), group:${group}`);
        const subscription: Subscription = group
            ? client.subscribe(subject, group, options)
            : client.subscribe(subject, options);

        subscription.on('message', (message: Message) =>
            this.handleMessage(
                client,
                subscription,
                pattern,
                subscriber,
                message,
            ),
        );
        subscription.on('error', (err) => this.logger.error(err));
    }

    protected async handleMessage(
        client: Stan,
        subscription: Subscription,
        pattern: string,
        subscriber: StanSubscriber,
        rawMessage: Message,
    ) {
        const context = new StanContext([rawMessage, subscription]);
        const message = this.deserializer.deserialize(rawMessage, subscriber);
        try {
            await this.handleEvent(pattern, message, context);
            !subscriber.disableAutoAck && rawMessage.ack();
        } catch (e) {
            this.logger.error(e.message, e.stack);
        }
    }

    close() {
        this.stanClient && this.stanClient.close();
        this.stanClient = null;
    }
}
