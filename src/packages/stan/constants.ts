import { Inject } from '@nestjs/common';

export const MEATADATA_SUBSCRIBER = `MEATADATA_SUBSCRIBER`;

export const STAN_PROVIDER_OPTIONS = 'STAN_PROVIDER_OPTIONS';
export const STAN_CONNECTION_NAME = 'STAN_CONNECTION_NAME';

export const STAN_CONNECTION_TOKEN = (name?: string) =>
    `STAN_CONNECTION(${name || 'default'})`;
export const InjectStan = (name?: string) =>
    Inject(STAN_CONNECTION_TOKEN(name));


export const STAN_TRANSPORT = 6001;