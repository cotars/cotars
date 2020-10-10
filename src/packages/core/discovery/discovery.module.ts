import { DiscoveryService } from './discovery.service';
import { Module } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core';

@Module({
    providers: [MetadataScanner, DiscoveryService],
    exports: [MetadataScanner, DiscoveryService],
})
export class DiscoveryModule {}
