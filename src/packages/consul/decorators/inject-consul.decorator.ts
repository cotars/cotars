import { CONSUL_PROVIDER } from '../constants';
import { Inject } from '@nestjs/common';

export const InjectConsul = () => Inject(CONSUL_PROVIDER);