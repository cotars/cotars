import * as gRPC from '@grpc/grpc-js';
import { isFunction } from '@nestjs/common/utils/shared.utils';
import { GRPC_CANCELLED } from '@nestjs/microservices/client/constants';
import { Observable, Subscriber, Subscription } from 'rxjs';


function observerForResponse(observer: Subscriber<any>) {
    return (err: Error, data: unknown) => {
        if (err) {
            return observer.error(err);
        }
        observer.next(data);
        observer.complete();
    };
}
export function createUnaryServiceMethod(
    call: Function,
    definition: gRPC.MethodDefinition<any, any>,
) {
    return <T>(
        request: T | Observable<T>,
        metadata?: gRPC.Metadata,
        options?: gRPC.CallOptions,
    ) => {
        if (
            definition.requestStream &&
            isFunction((request as Observable<T>)?.subscribe)
        ) {
            return new Observable((observer) => {
                const caller: gRPC.ClientWritableStream<T> = call(
                    metadata,
                    options,
                    observerForResponse(observer),
                );
                (request as Observable<T>).subscribe(
                    (val) => caller.write(val),
                    (err) => caller.emit('error', err),
                    () => caller.end(),
                );
            });
        } else {
            return new Observable((observer) => {
                call(request, metadata, options, observerForResponse(observer));
            });
        }
    };
}

export function createStreamServiceMethod(
    call: Function,
    definition: gRPC.MethodDefinition<any, any>,
) {
    return <T>(
        request: T | Observable<T>,
        metadata?: gRPC.Metadata,
        options?: gRPC.CallOptions,
    ) => {
        return new Observable((observer) => {
            let isClientCanceled = false;
            let upstreamSubscription: Subscription;
            const isRequestStream =
                definition.requestStream &&
                isFunction((request as Observable<T>)?.subscribe);

            const caller = isRequestStream
                ? call(metadata, options)
                : call(request, metadata, options);

            if (isRequestStream) {
                (request as Observable<T>).subscribe(
                    (val) => caller.write(val),
                    (err) => caller.emit('error', err),
                    () => caller.end(),
                );
            }
            caller.on('data', (data: unknown) => observer.next(data));
            caller.on('error', (error: gRPC.ServiceError) => {
                if (error.details === GRPC_CANCELLED) {
                    caller.destroy();
                    if (isClientCanceled) {
                        return;
                    }
                }
                observer.error(error);
            });
            caller.on('end', () => {
                if (upstreamSubscription) {
                    upstreamSubscription.unsubscribe();
                    upstreamSubscription = null;
                }
                caller.removeAllListeners();
                observer.complete();
            });
            return () => {
                if (upstreamSubscription) {
                    upstreamSubscription.unsubscribe();
                    upstreamSubscription = null;
                }
                if (caller.finished) {
                    return undefined;
                }
                isClientCanceled = true;
                caller.cancel();
            };
        });
    };
}

export function createClientService<T extends {}>(
    client: gRPC.Client,
    service: gRPC.ServiceDefinition,
): T {
    const methods = Object.keys(service);
    const services = {} as T;
    for (const method of methods) {
        const call = client[method];
        const definition = service[method];
        if (!definition.responseStream) {
            services[method] = createUnaryServiceMethod(call, definition);
        } else {
            services[method] = createStreamServiceMethod(call, definition);
        }
    }
    return services;
}
