export function sleep(milliseconds: number): Promise<true> {
    return new Promise<true>((reslove) => {
        setTimeout(reslove, milliseconds);
    });
}

export async function retry<T=unknown>(
    callback: Function,
    options?: {
        retryTimes?: number;
        retryInterval?: number;
        maxInterval?: number;
        err?: (err: Error) => void;
    },
): Promise<T> {
    options = options || {};
    options.retryTimes = options.retryTimes || 5
    let i = options.retryTimes;
    options.retryInterval = options.retryInterval || 3000;
    options.maxInterval = options.maxInterval || 60000;
    let runtimes = 0;
    while (--i) {
        runtimes++;
        try {
            return await callback();
        } catch (e) {
            options.err && options.err(e);
            await sleep(
                Math.min(options.maxInterval, options.retryInterval * runtimes),
            );
        }
    }
    throw new Error('call is max->'+JSON.stringify(options));
}
