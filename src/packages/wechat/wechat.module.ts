import { CONFIGURE_WECHATS } from './constants';
import { OAuthService } from './oauth.service';
import { IWechatConfig } from './wechat-config.interface';
import { ModuleAsyncOptions } from '@cotars/common';
import { DynamicModule, Module } from '@nestjs/common';

const CONFIGURE_WECHATS_ARR = [];

@Module({
    imports: [],
    providers: [
        { provide: CONFIGURE_WECHATS, useValue: CONFIGURE_WECHATS_ARR },
        OAuthService,
    ],
    exports: [OAuthService, CONFIGURE_WECHATS],
})
export class WeChatModule {
    static forRoot(options: IWechatConfig[]): DynamicModule {
        return this.register({ useValue: options });
    }

    static forRootAsync(
        async: ModuleAsyncOptions<IWechatConfig[]>,
    ): DynamicModule {
        return this.register(async);
    }

    private static register(
        options: ModuleAsyncOptions<IWechatConfig[]>,
    ): DynamicModule {
        const { imports, ...provider } = options;
        return {
            imports: options.imports || [],
            module: WeChatModule,
            providers: [{ provide: CONFIGURE_WECHATS, ...provider }],
            exports: [CONFIGURE_WECHATS],
        };
    }
}
