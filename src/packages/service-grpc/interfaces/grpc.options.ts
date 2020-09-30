import { IClientGRPCOptions, ILoader } from '@cotars/grpc';
import { ILoadBalance, IServiceNode } from '@cotars/service';

export interface IGRPCServiceOptions
    extends Omit<IClientGRPCOptions, 'package' | 'url'> {
    loadBalance: ILoadBalance<any>;
}

export interface IGRPCNodeServiceOptions extends IServiceNode {
    loader: ILoader;
}

export interface GRPCModuleOptions
    extends Pick<IClientGRPCOptions, 'package' | 'loader'> {}

export interface GRPCPackageModuleOptions
    extends Pick<IClientGRPCOptions, 'loader'> {}


export interface GRPCNodeOptions {
    name: string;
    loader: ILoader;
}