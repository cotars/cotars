import { Inject } from '@nestjs/common';
export const METADATA_SERVICE_PATH = 'METADATA_SERVICE_PATH';
export const GRPC_PATTERN_TRANSPORT = 6000;
export const EVENT_PATTERN_TRANSPORT = 6001;

export const SERVICE_CLIENT = (service: string) => `SERVICE_CLIENT(${service})`;
export const SERVICE_CLIENT_OPTIONS = (service: string) =>
    `SERVICE_CLIENT_OPTIONS(${service})`;

export const InjectService = (service: string) =>
    Inject(SERVICE_CLIENT(service));