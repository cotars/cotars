import { isFunction, isString } from '@nestjs/common/utils/shared.utils';
import { Serializer } from '@nestjs/microservices';
import { Message } from 'protobufjs';

export class StanSerializer implements Serializer {
    serialize(value: any) {
        if (
            isString(value) ||
            value instanceof Buffer ||
            value instanceof Uint8Array
        ) {
            return value;
        }
        return JSON.stringify(value);
    }
}
