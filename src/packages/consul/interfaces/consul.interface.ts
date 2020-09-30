import { Status } from '../enums';

export interface ITaggedAddresses {
    [name: string]: { address: string; port: number };
}

export interface ITaggedAddressHost {
    [name: string]: string;
}

export interface IMetadata {
    [key: string]: string;
}

export interface ICheck {
    Node: string;
    CheckID: string;
    Name: string;
    Status: Status;
    Notes: string;
    Output: string;
    ServiceID: string;
    ServiceName: string;
    ServiceTags: string[];
}

export interface IAgentChecksResponse {
    [service: string]: ICheck;
}

export interface IService {
    ID: string;
    Service: string;
    Tags: string[];
    TaggedAddresses: ITaggedAddresses;
    Meta: IMetadata;
    Port: number;
    Address: string;
    EnableTagOverride: boolean;
    Weights?: { [status: string]: number };
}

export interface IUpstream {
    DestinationType: string;
    DestinationName: string;
    LocalBindPort: number;
}

export interface IProxy {
    DestinationServiceName: string;
    DestinationServiceID: string;
    LocalServiceAddress: string;
    LocalServicePort: number;
    Config: IMetadata;
}

export interface IAgentServiceResponse extends IService {
    Kind: string;
    ContentHash: string;
    Upstreams: IUpstream[];
}

export interface IConnect {
    Native: boolean;
    Proxy: IProxy;
}

export interface IAgentHealth extends Omit<IService, 'Weights'> {
    Connect: IConnect;
    CreateIndex: number;
    ModifyIndex: number;
}

export interface IAgentHealthResponse {
    [status: string]: IAgentHealth[];
}

export type ICatalogDatacentersResponse = string[];

export interface INode {
    ID?: string;
    Node: string;
    Address: string;
    Datacenter?: string;
    TaggedAddresses?: ITaggedAddressHost;
    NodeMeta?: IMetadata;
}

export type ICatalogNodesResponse = INode[];

export type ICatalogServicesResponse = { [service: string]: string[] };

export interface INodeService extends INode {
    CreateIndex: number;
    ModifyIndex: number;

    ServiceAddress: string;
    ServiceEnableTagOverride: boolean;
    ServiceID: string;
    ServiceName: string;
    ServicePort: number;
    ServiceMeta: IMetadata;
    ServiceTaggedAddresses: ITaggedAddresses;
    ServiceTags: string[];
    ServiceProxy: IProxy;
    ServiceConnect: IConnect;
    Namespace: string;
}

export type ICatalogServiceResponse = INodeService[];

export interface ICatalogNodeResponse {
    Node: INode;
    Services: { [service: string]: IService };
}

export interface ICatalogNodeServicesResponse {
    Node: INode;
    Services: IService[];
}

export interface IKVResponse {
    CreateIndex: number;
    ModifyIndex: number;
    LockIndex: number;
    Key: string;
    Flags: number;
    Value: string;
    Session: string;
}

export interface IEvent {
    ID: string;
    Name: string;
    Payload: string;
    NodeFilter: string;
    ServiceFilter: string;
    TagFilter: string;
    Version: number;
    LTime: number;
}
export interface IEventFireResponse extends IEvent {}

export type IEventListResponse = IEvent[];

export interface IHealthCheck extends ICheck {
    ID: string;
    Namespace: string;
}

export type IHealthNodeResponse = IHealthCheck[];

export type IHealthChecksResponse = ICheck & { Namespace: string }[];

export interface IHealthService {
    Node: INode;
    Service: IService;
    Checks: ICheck[];
}

export type IHealthServiceResponse = IHealthService[];

export type IHealthStateResponse = ICheck[];