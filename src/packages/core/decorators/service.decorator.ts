import { isFullServiceName, isMethodName } from '../utils/service.util';
import { applyDecorators, Controller, SetMetadata } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import {
    EVENT_PATTERN_TRANSPORT,
    GRPC_PATTERN_TRANSPORT,
    METADATA_SERVICE_PATH,
} from '../constants';

export function Service(name: string): ClassDecorator {
    if (!isFullServiceName(name)) {
        throw new Error(
            'service decorator must be full name(like: a.b.c@Service)',
        );
    }
    return applyDecorators(
        Controller(),
        SetMetadata(METADATA_SERVICE_PATH, name),
    );
}

export function GRPC(method?: string, transport = GRPC_PATTERN_TRANSPORT) {
    if (!isMethodName(method)) {
        throw new Error('method decorator not like(a.b.c@Service/rpc or rpc)');
    }
    return (
        target: object,
        key: string | symbol,
        descriptor: PropertyDescriptor,
    ) => {
        MessagePattern({ method, target }, transport)(target, key, descriptor);
    };
}

export function Subscribe<T = any>(
    subject: string,
    options?: T,
    transport = EVENT_PATTERN_TRANSPORT,
) {
    if (!isFullServiceName(subject)) {
        throw new Error(
            'service decorator must be full name(like: a.b.c@Service)',
        );
    }
    return applyDecorators(EventPattern({ subject, ...options }, transport));
}
