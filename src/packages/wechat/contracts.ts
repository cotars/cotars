export interface WeChatToken {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    openid: string;
    scope: string;

}

export interface WeChatError {
    errcode: number;
    errmsg: string;
}

export interface WeChatUserInfo {
    openid: string;
    nickname: string;
    sex: string;
    province: string;
    city: string;
    country: string;
    headimgurl: string;
    privilege: string[];
    unionid: string;
}