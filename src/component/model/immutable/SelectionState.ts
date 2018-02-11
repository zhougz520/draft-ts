import { Record } from 'immutable';

const defaultRecord: {
    anchorKey: string,
    anchorOffset: number,
    focusKey: string,
    focusOffset: number,
    isBackward: boolean,
    hasFocus: boolean,
} = {
        anchorKey: '',
        anchorOffset: 0,
        focusKey: '',
        focusOffset: 0,
        isBackward: false,
        hasFocus: false
    };

export const SelectionStateRecord: Record.Class = Record(defaultRecord);

export class SelectionState extends SelectionStateRecord {
    static createEmpty(key: string): SelectionState {
        return new SelectionState({
            anchorKey: key,
            anchorOffset: 0,
            focusKey: key,
            focusOffset: 0,
            isBackward: false,
            hasFocus: false
        });
    }

    serialize(): string {
        return (
            'Anchor: ' +
            this.getAnchorKey() +
            ':' +
            this.getAnchorOffset() +
            ', ' +
            'Focus: ' +
            this.getFocusKey() +
            ':' +
            this.getFocusOffset() +
            ', ' +
            'Is Backward: ' +
            String(this.getIsBackward()) +
            ', ' +
            'Has Focus: ' +
            String(this.getHasFocus())
        );
    }

    getAnchorKey(): string {
        return this.get('anchorKey');
    }

    getAnchorOffset(): number {
        return this.get('anchorOffset');
    }

    getFocusKey(): string {
        return this.get('focusKey');
    }

    getFocusOffset(): number {
        return this.get('focusOffset');
    }

    getIsBackward(): boolean {
        return this.get('isBackward');
    }

    /**
     * 判断是否有焦点
     */
    getHasFocus(): boolean {
        return this.get('hasFocus');
    }

    /**
     * Return whether the specified range overlaps with an edge of the
     * SelectionState.
     */
    hasEdgeWithin(blockKey: string, start: number, end: number): boolean {
        const anchorKey: string = this.getAnchorKey();
        const focusKey: string = this.getFocusKey();

        if (anchorKey === focusKey && anchorKey === blockKey) {
            const selectionStart: number = this.getStartOffset();
            const selectionEnd: number = this.getEndOffset();

            return start <= selectionEnd && selectionStart <= end;
        }

        if (blockKey !== anchorKey && blockKey !== focusKey) {
            return false;
        }

        const offsetToCheck: number =
            blockKey === anchorKey ? this.getAnchorOffset() : this.getFocusOffset();

        return start <= offsetToCheck && end >= offsetToCheck;
    }

    /**
     * 判断锚点`Anchor`与焦点`Focus`是否相同
     */
    isCollapsed(): boolean {
        return (
            this.getAnchorKey() === this.getFocusKey() &&
            this.getAnchorOffset() === this.getFocusOffset()
        );
    }

    getStartKey(): string {
        return this.getIsBackward() ? this.getFocusKey() : this.getAnchorKey();
    }

    getStartOffset(): number {
        return this.getIsBackward()
            ? this.getFocusOffset()
            : this.getAnchorOffset();
    }

    getEndKey(): string {
        return this.getIsBackward() ? this.getAnchorKey() : this.getFocusKey();
    }

    getEndOffset(): number {
        return this.getIsBackward()
            ? this.getAnchorOffset()
            : this.getFocusOffset();
    }
}
