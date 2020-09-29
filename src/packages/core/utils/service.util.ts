
const packageNameRegExp = /^([a-z][a-zA-Z0-9]*)+([.][a-z][a-zA-Z0-9]*)+$/;

const fullServiceRegExpRegExp = /^([a-z][a-zA-Z0-9]*)+([.][a-z][a-zA-Z0-9]*)+\@[A-Z][a-zA-Z0-9]+$/;
const serviceRegExp = /[A-Z][a-zA-Z0-9]+$/;

const fullMethodRegExp = /^([a-z][a-zA-Z0-9]*)+([.][a-z][a-zA-Z0-9]*)+\@[A-Z][a-zA-Z0-9]+\/[a-z][a-zA-Z0-9]+$/;
const methodRegExp = /[a-z][a-zA-Z0-9]+$/;

export function isPackageName(name: string) {
    return packageNameRegExp.test(name);
}

export function isFullServiceName(name: string) {
    return fullServiceRegExpRegExp.test(name);
}

export function isServiceName(name: string) {
    return fullServiceRegExpRegExp.test(name) || serviceRegExp.test(name);
}

export function isFullMethodName(name: string) {
    return fullMethodRegExp.test(name);
}

export function isMethodName(name: string) {
    return fullMethodRegExp.test(name) || methodRegExp.test(name);
}