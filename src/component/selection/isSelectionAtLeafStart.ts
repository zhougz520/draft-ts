import { EditorState } from '../model/immutable/EditorState';
import { SelectionState } from '../model/immutable/SelectionState';
import { List } from 'immutable';

export function isSelectionAtLeafStart(editorState: EditorState): boolean {
    const selection: SelectionState = editorState.getSelection();
    const anchorKey: string = selection.getAnchorKey();
    const blockTree: List<any> = editorState.getBlockTree(anchorKey);
    const offset: number = selection.getStartOffset();

    let isAtStart: boolean = false;

    blockTree.some(
        (leafSet: any) => {
            if (offset === leafSet.get('start')) {
                isAtStart = true;

                return true;
            }

            if (offset < leafSet.get('end')) {
                return leafSet.get('leaves').some(
                    (leaf: any) => {
                        const leafStart: number = leaf.get('start');
                        if (offset === leafStart) {
                            isAtStart = true;

                            return true;
                        }

                        return false;
                    });
            }

            return false;
        }
    );

    return isAtStart;
}
