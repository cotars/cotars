import { STAN_PROVIDER_OPTIONS } from './constants';
import { StanProviderOptions } from './interfaces';
import { StanDeserializer } from './stan-deserializer';
import { StanSerializer } from './stan-serializer';
import { Inject, Logger } from '@nestjs/common';
import { ERROR_EVENT } from '@nestjs/microservices/constants';
import { connect, Stan } from 'node-nats-streaming';
import { share } from 'rxjs/operators';
import {
    ClientProxy,
    ReadPacket,
    WritePacket,
} from '@nestjs/microservices';

export class ClientStan extends ClientProxy {
    protected readonly logger = new Logger(ClientProxy.name);
    protected stanClient: Stan;
    protected connection: Promise<any>;

    constructor(
        @Inject(STAN_PROVIDER_OPTIONS) protected options: StanProviderOptions,
    ) {
        super();
        this.initialize();
    }

    protected initialize() {
        this.options.serializer ||= new StanSerializer;
        this.options.deserializer ||= new StanDeserializer;
        this.initializeSerializer(this.options);
        this.initializeDeserializer(this.options);
    }

    public close() {
        this.stanClient && this.stanClient.close();
        this.stanClient = null;
        this.connection = null;
    }

    async connect(): Promise<Stan> {
        if (this.stanClient) {
            return this.stanClient;
        }
        this.stanClient = this.createStan();
        this.handleError(this.stanClient);
        this.connection = await this.connect$(this.stanClient)
            .pipe(share())
            .toPromise();
        return this.connection;
    }

    protected createStan(): Stan {
        return connect(
            this.options.clusterID,
            this.options.clientID,
            this.options.stanOptions,
        );
    }

    public handleError(client: Stan) {
        client.addListener(ERROR_EVENT, (err: Error) => this.logger.error(err));
    }

    protected publish(
        packet: ReadPacket<any>,
        callback: (packet: WritePacket<any>) => void,
    ): Function {
        throw new Error('stan not support publish or send');
    }
    protected dispatchEvent<T = any>(packet: ReadPacket<any>): Promise<T> {
        const pattern = this.normalizePattern(packet.pattern);
        const serializedPacket = this.serializer.serialize(packet.data);
        return new Promise((resolve, reject) =>
            this.stanClient.publish(
                pattern,
                serializedPacket,
                (err, guid) =>
                    err ? reject(err) : resolve((guid as unknown) as T),
            ),
        );
    }
}
