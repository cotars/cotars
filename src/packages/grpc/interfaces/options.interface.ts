import { IChannelOptions } from './channel-options.interface';
import { ILoader } from './loader.interface';
import * as GRPC from '@grpc/grpc-js';

export interface IGRPCOptions {
    url?: string;
    package: string | string[];
    loader: ILoader;
    maxSendMessageLength?: number;
    maxReceiveMessageLength?: number;
    maxMetadataSize?: number;
    keepalive?: {
        keepaliveTimeMs?: number;
        keepaliveTimeoutMs?: number;
        keepalivePermitWithoutCalls?: number;
        http2MaxPingsWithoutData?: number;
        http2MinTimeBetweenPingsMs?: number;
        http2MinPingIntervalWithoutDataMs?: number;
        http2MaxPingStrikes?: number;
    };
    channelOptions?: IChannelOptions;
}

export interface IServerGRPCOptions extends IGRPCOptions {
    credentials?: GRPC.ServerCredentials;
    bindCallback?: (port: number) => void;
}

export interface IClientGRPCOptions extends IGRPCOptions {
    credentials?: GRPC.CallCredentials;
}

