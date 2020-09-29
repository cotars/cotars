import { IServerGRPCOptions } from './interfaces/options.interface';
import { deepGetServices } from './utils';
import { GRPC_PATTERN_TRANSPORT, isFullMethodName, METADATA_SERVICE_PATH } from '@cotars/core';
import * as GRPC from '@grpc/grpc-js';
import { isObject } from '@nestjs/common/utils/shared.utils';
import { InvalidGrpcPackageException } from '@nestjs/microservices/errors/invalid-grpc-package.exception';
import { get } from 'lodash';

import {
    CustomTransportStrategy,
    MessageHandler,
    Server,
} from '@nestjs/microservices';
import {
    GRPC_DEFAULT_URL,
} from '@nestjs/microservices/constants';

export class ServerGRPC extends Server implements CustomTransportStrategy {
    public readonly transportId = GRPC_PATTERN_TRANSPORT;
    protected readonly url: string;
    protected grpcServer: GRPC.Server;
    constructor(protected readonly options: IServerGRPCOptions) {
        super();
        this.grpcServer = new GRPC.Server(options.channelOptions);
        this.url = this.getOptionsProp(options, 'url') || GRPC_DEFAULT_URL;
    }

    addHandler(pattern: {method: string, target?: any}, callback: MessageHandler, isEventHandler?: boolean) {
        if (!isObject(pattern) || pattern.method || !pattern.target) {
            throw new Error('grpc service pattern not support');
        }
        let service = '';
        if (!isFullMethodName(pattern.method)) {
            service = Reflect.getMetadata(
                METADATA_SERVICE_PATH,
                pattern.target.constructor,
            );
        }
        const methodPattern = `/${service}/${pattern.method}/`;
        return super.addHandler(methodPattern, callback, isEventHandler);
    }

    async listen(callback: () => void) {
        this.bindEvent();
        const port = await this.grpcBindAsync();
        if (this.options.bindCallback) {
            this.options.bindCallback(port);
        }
        this.grpcServer.start();
        callback();
    }

    protected bindEvent() {
        const loaded = this.options.loader.getDefinition();
        const grpcContext = GRPC.loadPackageDefinition(loaded.definition);
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
            deepGetServices(grpcPkg as GRPC.GrpcObject, packageName).forEach((v) =>
                this.createService(v.clientRef.service),
            );
        }
    }

    protected getHandlerByMethodDefinition(
        definition: GRPC.MethodDefinition<any, any>,
    ): MessageHandler {
        return this.getHandlerByPattern(definition.path);
    }

    protected createImplementation(
        method: GRPC.MethodDefinition<any, any>,
    ): GRPC.UntypedHandleCall {
        const handler = this.getHandlerByMethodDefinition(method);
        if (!method.requestStream && !method.responseStream) {
            return this.createServerUnaryCall(handler);
        }
        return;
    }

    protected createService(service: GRPC.ServiceDefinition) {
        const implementations: GRPC.UntypedServiceImplementation = {};
        const methods = Object.keys(service);
        for (const method of methods) {
            const methodDefined = service[method];
            const implementation = this.createImplementation(methodDefined);
            if (!implementation) {
                this.logger.warn(
                    `grpc ${methodDefined.path} not implementation!`,
                );
            } else {
                implementations[method] = implementation;
                this.logger.debug(`grpc ${methodDefined.path} implementation!`);
            }
        }
        this.grpcServer.addService(service, implementations);
    }

    protected createServerUnaryCall(
        methodHandler: Function,
    ): GRPC.UntypedHandleCall {
        return async (
            call: GRPC.ServerUnaryCall<any, any>,
            callback: GRPC.sendUnaryData<any>,
        ) => {
            const handler = methodHandler(call.request, call.metadata);
            this.transformToObservable(await handler).subscribe(
                (data) => callback(null, data),
                (err: any) => callback(err, null),
            );
        };
    }

    protected grpcBindAsync(): Promise<number> {
        const credentials =
            this.options.credentials || GRPC.ServerCredentials.createInsecure();
        return new Promise((reslove, reject) => {
            this.grpcServer.bindAsync(this.url, credentials, (error, port) => {
                if (error) {
                    this.logger.error(error.message, error.stack);
                    reject(port);
                } else {
                    this.logger.log(`grpc(${this.url}) listen in:${port}`);
                    reslove(port);
                }
            });
        });
    }

    close() {
        this.grpcServer && this.grpcServer.forceShutdown();
        this.grpcServer = null;
    }
}
