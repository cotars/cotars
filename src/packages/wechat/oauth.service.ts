import { CONFIGURE_WECHATS } from './constants';
import { OAuthClient } from './oauth-client.servce';
import { IWechatConfig } from './wechat-config.interface';
import { HttpService, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class OAuthService {
    public readonly clients: Map<string, OAuthClient> = new Map();
    constructor(
        @Inject(CONFIGURE_WECHATS) protected configs: IWechatConfig[],
        protected http: HttpService,
    ) {}
    public pick(appid: string) {
        if (!this.clients.has(appid)) {
            const config = this.configs.find(v => v.appid == appid);
            if (!config || !config.appid) {
                throw new Error(`wechat config not found(${appid})`);
            }
            this.clients.set(appid, new OAuthClient(config, this.http));
        }
        return this.clients.get(appid);
    }
}
