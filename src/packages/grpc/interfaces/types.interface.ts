import {
    CallOptions,
    Client,
    Metadata,
    ServiceDefinition
    } from '@grpc/grpc-js';
import { Type } from '@nestjs/common';
import { Observable } from 'rxjs';

export type ClientRequestUnaryMethod<TRequest, TResponse> = (
    request: TRequest,
    metadata?: Metadata,
    options?: Partial<CallOptions>,
) => Observable<TResponse>;


export type ClientRequestStreamMethod<TRequest, TResponse> = (
    request: Observable<TRequest>,
    metadata?: Metadata,
    options?: Partial<CallOptions>,
) => Observable<TResponse>;


export type GRPCServiceClient = Type<Client> & {service: ServiceDefinition};

export interface PBTypeDefinition {
    format: string;
    type: object;
    fileDescriptorProtos: Buffer[];
}

export type PackageDefinition = {
    [index: string]: ServiceDefinition | PBTypeDefinition;
}