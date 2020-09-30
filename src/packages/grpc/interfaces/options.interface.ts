import { IChannelOptions } from './channel-options.interface';
import { ILoader } from './loader.interface';
import * as GRPC from '@grpc/grpc-js';

export interface IGRPCCommonOptions {
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

export interface IServerGRPCOptions extends IGRPCCommonOptions {
    url?: string;
    credentials?: GRPC.ServerCredentials;
    packages: {name: string, loader: ILoader}[];
    bindCallback?: (port: number) => void;
}

export interface IClientGRPCOptions extends IGRPCCommonOptions {
    url?: string;
    package: string;
    loader: ILoader;
    credentials?: GRPC.CallCredentials;
}

