import { IClientGRPCOptions } from './interfaces/options.interface';
import { createClientService, deepGetServices } from './utils';
import * as gRPC from '@grpc/grpc-js';
import { Logger, Type } from '@nestjs/common';
import { isObject } from '@nestjs/common/utils/shared.utils';
import { InvalidGrpcPackageException } from '@nestjs/microservices/errors/invalid-grpc-package.exception';
import { InvalidGrpcServiceException } from '@nestjs/microservices/errors/invalid-grpc-service.exception';
import { get } from 'lodash';
import { Observable } from 'rxjs';
import {
    ClientGrpc as NestClientGrpc,
    ClientProxy,
    ReadPacket,
    WritePacket,
} from '@nestjs/microservices';
import {
    GRPC_DEFAULT_MAX_RECEIVE_MESSAGE_LENGTH,
    GRPC_DEFAULT_MAX_SEND_MESSAGE_LENGTH,
    GRPC_DEFAULT_URL,
} from '@nestjs/microservices/constants';

export class ClientGrpc extends ClientProxy implements NestClientGrpc {
    protected readonly logger = new Logger(ClientProxy.name);
    protected readonly url: string;
    protected readonly clients: Map<string, gRPC.Client> = new Map();
    protected readonly clientRefs: Map<
        string,
        Type<gRPC.Client> & { service: gRPC.ServiceDefinition }
    > = new Map();

    constructor(protected readonly options: IClientGRPCOptions) {
        super();
        this.url = this.getOptionsProp(options, 'url') || GRPC_DEFAULT_URL;
        this.createClients();
    }

    protected createClients() {
        const loaded = this.options.loader.getDefinition();
        const grpcContext = gRPC.loadPackageDefinition(loaded.definition);
        const packageOption = this.getOptionsProp(this.options, 'package');
        const packageNames = Array.isArray(packageOption)
            ? packageOption
            : [packageOption];
        for (const packageName of packageNames) {
            const grpcPkg = get(grpcContext, packageName);
            if (!grpcPkg) {
                const invalidPackageError = new InvalidGrpcPackageException();
                this.logger.error(
                    invalidPackageError.message,
                    invalidPackageError.stack,
                );
                throw invalidPackageError;
            }

            deepGetServices(grpcPkg as gRPC.GrpcObject, packageName).forEach(
                (v) => {
                    this.clientRefs.set(v.path, v.clientRef);
                },
            );
        }
    }

    getService<T extends {}>(name: string): T & gRPC.Client {
        const client = this.getClientByServiceName(name);
        return createClientService(client, this.clientRefs.get(name).service);
    }

    protected createClientByServiceName(name: string): gRPC.Client {
        const clientRef = this.clientRefs.get(name);
        if (!clientRef) {
            throw new InvalidGrpcServiceException();
        }
        const maxSendMessageLengthKey = 'grpc.max_send_message_length';
        const maxReceiveMessageLengthKey = 'grpc.max_receive_message_length';
        const maxMessageLengthOptions = {
            [maxSendMessageLengthKey]: this.getOptionsProp(
                this.options,
                'maxSendMessageLength',
                GRPC_DEFAULT_MAX_SEND_MESSAGE_LENGTH,
            ),
            [maxReceiveMessageLengthKey]: this.getOptionsProp(
                this.options,
                'maxReceiveMessageLength',
                GRPC_DEFAULT_MAX_RECEIVE_MESSAGE_LENGTH,
            ),
        };

        const maxMetadataSize = this.getOptionsProp(
            this.options,
            'maxMetadataSize',
            -1,
        );
        if (maxMetadataSize > 0) {
            maxMessageLengthOptions['grpc.max_metadata_size'] = maxMetadataSize;
        }

        const keepaliveOptions = this.getKeepaliveOptions();
        const options: Record<string, string | number> = {
            ...(this.options.channelOptions || {}),
            ...maxMessageLengthOptions,
            ...keepaliveOptions,
        };
        const credentials =
            this.options.credentials || gRPC.credentials.createInsecure();
        const grpcClient = new clientRef(this.url, credentials, options);
        this.clients.set(name, grpcClient);
        return grpcClient as gRPC.Client;
    }

    public getKeepaliveOptions() {
        if (!isObject(this.options.keepalive)) {
            return {};
        }
        const keepaliveKeys: Record<
            keyof IClientGRPCOptions['keepalive'],
            string
        > = {
            keepaliveTimeMs: 'grpc.keepalive_time_ms',
            keepaliveTimeoutMs: 'grpc.keepalive_timeout_ms',
            keepalivePermitWithoutCalls: 'grpc.keepalive_permit_without_calls',
            http2MaxPingsWithoutData: 'grpc.http2.max_pings_without_data',
            http2MinTimeBetweenPingsMs: 'grpc.http2.min_time_between_pings_ms',
            http2MinPingIntervalWithoutDataMs:
                'grpc.http2.min_ping_interval_without_data_ms',
            http2MaxPingStrikes: 'grpc.http2.max_ping_strikes',
        };

        const keepaliveOptions = {};
        for (const [optionKey, optionValue] of Object.entries(
            this.options.keepalive,
        )) {
            const key = keepaliveKeys[optionKey];
            if (key === undefined) {
                continue;
            }
            keepaliveOptions[key] = optionValue;
        }
        return keepaliveOptions;
    }

    public getClientByServiceName<T = gRPC.Client>(name: string): T {
        const client =
            this.clients.get(name) || this.createClientByServiceName(name);
        return (client as unknown) as T;
    }

    async connect(): Promise<any> {
        
    }
    close() {
        throw new Error('Method not implemented.');
    }
    public send<TResult = any, TInput = any>(
        pattern: any,
        data: TInput,
    ): Observable<TResult> {
        throw new Error(
            'Method is not supported in gRPC mode. Use ClientGrpc instead (learn more in the documentation).',
        );
    }

    protected publish(
        packet: ReadPacket<any>,
        callback: (packet: WritePacket<any>) => void,
    ): Function {
        throw new Error(
            'Method is not supported in gRPC mode. Use ClientGrpc instead (learn more in the documentation).',
        );
    }
    protected dispatchEvent<T = any>(packet: ReadPacket<any>): Promise<T> {
        throw new Error(
            'Method is not supported in gRPC mode. Use ClientGrpc instead (learn more in the documentation).',
        );
    }
}
