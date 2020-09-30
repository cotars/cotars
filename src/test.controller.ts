import { GRPC, Service } from '@cotars/core';

@Service('aa.bbb.cc@Test')
export class TestController {
    @GRPC('test')
    test() {
        
    }
}