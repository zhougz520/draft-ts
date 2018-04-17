import { utils } from './fbjs';
const { UserAgent } = utils;

const isOSX = UserAgent.isPlatform('Mac OS X');

export const KeyBindingUtil: any = {
    isCtrlKeyCommand(e: any): boolean {
        return !!e.ctrlKey && !e.altKey;
    },

    isOptionKeyCommand(e: any): boolean {
        return isOSX && e.altKey;
    },

    hasCommandModifier(e: any): boolean {
        return isOSX
            ? !!e.metaKey && !e.altKey
            : KeyBindingUtil.isCtrlKeyCommand(e);
    }
};
