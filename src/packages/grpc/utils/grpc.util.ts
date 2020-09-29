import { GRPCServiceClient } from '../interfaces/types.interface';
import * as gRPC from '@grpc/grpc-js';
import { isObject } from '@nestjs/common/utils/shared.utils';

export function isProtobufType(obj: gRPC.GrpcObject) {
    return !!obj?.format && !!obj?.type && !!obj?.fileDescriptorProtos;
}

export function isServiceDefined(obj: gRPC.GrpcObject) {
    return !!obj?.service;
}

export function deepGetServices(
    grpcPkg: gRPC.GrpcObject,
    pkgName?: string,
): { path: string; clientRef: GRPCServiceClient}[] {
    pkgName = pkgName || '';
    const services: { path: string; clientRef: GRPCServiceClient }[] = [];
    const deepSeach = (pkg: gRPC.GrpcObject, path: string) => {
        const keys = Object.keys(pkg);
        keys.forEach((key) => {
            const ns = path ? `${path}.` : '';
            const definition = pkg[key];
            if (isServiceDefined(definition as gRPC.GrpcObject)) {
                services.push({
                    path: `${ns}${key}`,
                    clientRef: definition as GRPCServiceClient,
                });
            } else if (
                isObject(definition) &&
                !isProtobufType(definition as gRPC.GrpcObject)
            ) {
                deepSeach(definition as gRPC.GrpcObject, `${ns}${key}`);
            }
        });
    };
    deepSeach(grpcPkg, pkgName);
    return services;
}
