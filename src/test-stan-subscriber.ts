import { Subscribe } from '@cotars/core';
import { ClientStan, InjectStan } from '@cotars/stan';
import { Controller, Injectable, OnModuleInit } from '@nestjs/common';

@Controller()
export class TestStanSubscriber implements OnModuleInit {
    constructor(
        protected client: ClientStan,
        @InjectStan() protected client2: ClientStan,
    ) {
        console.log(client, client2 == client);
    }


    @Subscribe('test.test@Abc')
    protected test(data: any) {
        console.log(data);
    }

    async onModuleInit() {

        setInterval(async () => {
            await this.client.emit('test.test@Abc', {aa: Date.now()}).toPromise();
        }, 5000)
    }
}
