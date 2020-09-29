import { ILoader } from '../interfaces/loader.interface';
import { PackageDefinition, PBTypeDefinition } from '../interfaces/types.interface';
import { getAllHandledReflectionObjects } from '../utils';
import * as grpc from '@grpc/grpc-js';
import { camelCase } from 'lodash';
import * as PB from 'protobufjs';


export abstract class Loader implements ILoader {
    public readonly root: PB.Root;

    constructor(protected converOption?: PB.IConversionOptions) {}

    getDefinition() {
        const definition: PackageDefinition = {};
        const objects = getAllHandledReflectionObjects(this.root, '');
        objects.forEach((v) => {
            definition[v.path] = this.createDefinition(v.obj, v.path, this.converOption);
        });
        return { root: this.root, definition };
    }

    protected createDefinition(
        obj: PB.Service | PB.Type | PB.Enum,
        name: string,
        options: PB.IConversionOptions,
    ): PBTypeDefinition | grpc.ServiceDefinition {
        if (obj instanceof PB.Service) {
            return this.createServiceDefinition(obj, name, options);
        } else if (obj instanceof PB.Type) {
            return this.createMessageDefinition(obj);
        } else if (obj instanceof PB.Enum) {
            return this.createEnumDefinition(obj);
        } else {
            throw new Error('Type mismatch in reflection object handling');
        }
    }

    protected createEnumDefinition(enumType: PB.Enum): PBTypeDefinition {
        const enumDescriptor = (enumType as any).toDescriptor('proto3');
        return {
            format: 'Protocol Buffer 3 EnumDescriptorProto',
            type: enumDescriptor.$type.toObject(enumDescriptor),
            fileDescriptorProtos: null,
        };
    }

    protected createMessageDefinition(
        message: PB.Type,
    ): PBTypeDefinition {
        const messageDescriptor = (message as any).toDescriptor('proto3');
        return {
            format: 'Protocol Buffer 3 DescriptorProto',
            type: messageDescriptor.$type.toObject(messageDescriptor),
            fileDescriptorProtos: null,
        };
    }

    protected createServiceDefinition(
        service: PB.Service,
        name: string,
        options: PB.IConversionOptions,
    ): grpc.ServiceDefinition {
        const definition = {};
        for (const method of service.methodsArray) {
            definition[method.name] = this.createMethodDefinition(
                method,
                name,
                options,
            );
        }
        return definition;
    }

    protected createDeserializer<T = object>(
        cls: PB.Type,
        options?: PB.IConversionOptions,
    ): grpc.deserialize<T> {
        return (argBuf: Buffer): T => {
            return cls.toObject(cls.decode(argBuf), options) as T;
        };
    }

    protected createSerializer<T>(cls: PB.Type): grpc.serialize<T> {
        return (arg: T): Buffer => {
            const message = cls.fromObject(arg);
            return cls.encode(message).finish() as Buffer;
        };
    }

    protected createMethodDefinition(
        method: PB.Method,
        serviceName: string,
        options?: PB.IConversionOptions,
    ): grpc.MethodDefinition<object, object> {
        const requestType: PB.Type = method.resolvedRequestType!;
        const responseType: PB.Type = method.resolvedResponseType!;
        return {
            path: '/' + serviceName + '/' + method.name,
            requestStream: !!method.requestStream,
            responseStream: !!method.responseStream,
            requestSerialize: this.createSerializer(requestType),
            requestDeserialize: this.createDeserializer(requestType, options),
            responseSerialize: this.createSerializer(responseType),
            responseDeserialize: this.createDeserializer(responseType, options),
            // TODO(murgatroid99): Find a better way to handle this
            originalName: camelCase(method.name),
        };
    }
}
