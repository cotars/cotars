import { WeChatError, WeChatToken, WeChatUserInfo } from './contracts';
import { IWechatConfig } from './wechat-config.interface';
import { HttpService } from '@nestjs/common';
import { stringify as queryStringify } from 'qs';
export class OAuthClient {
    constructor(
        public readonly config: IWechatConfig,
        protected http: HttpService,
    ) {}

    public async accessToken(code: string): Promise<WeChatToken> {
        return await this.getResponse<WeChatToken>(
            `https://api.weixin.qq.com` +
                `/sns/oauth2/access_token?` +
                `appid=${this.config.appid}` +
                `&secret=${this.config.secret}` +
                `&code=${code}&grant_type=authorization_code`,
        );
    }

    public async refreshToken(accessToken: string): Promise<WeChatToken> {
        return await this.getResponse<WeChatToken>(
            `https://api.weixin.qq.com` +
                `/sns/oauth2/refresh_token?` +
                `appid=${this.config.appid}` +
                `&refresh_token=${accessToken}` +
                `&grant_type=refresh_token`,
        );
    }

    public async userinfo(
        accessToken: string,
        openid: string,
    ): Promise<WeChatUserInfo> {
        return await this.getResponse<WeChatUserInfo>(
            `https://api.weixin.qq.com/sns/userinfo?` +
                `access_token=${accessToken}` +
                `&openid=${openid}`,
        );
    }

    public async authed(accessToken: string, openid: string): Promise<boolean> {
        await this.getResponse<WeChatError>(
            `https://api.weixin.qq.com/sns/auth?` +
                `access_token=${accessToken}` +
                `&openid=${openid}`,
        );
        return true;
    }

    public connectQR(redirect: string, state: string = ''): string {
        return (
            `https://open.weixin.qq.com/connect/qrconnect?` +
            queryStringify({
                appid: this.config.appid,
                redirect_uri: redirect,
                response_type: 'code',
                scope: 'snsapi_login',
                state: 'state',
            }) +
            '#wechat_redirect'
        );
    }

    protected async getResponse<T>(url: string) {
        const resp = await this.http.get<T | WeChatError>(url).toPromise();

        const error = resp.data as WeChatError;
        if (error.errcode) {
            throw new Error(`[${error.errcode}]${error.errmsg}`);
        }
        return resp.data as T;
    }
}
