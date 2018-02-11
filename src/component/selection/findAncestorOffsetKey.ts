import { getSelectionOffsetKeyForNode } from './getSelectionOffsetKeyForNode';

export function findAncestorOffsetKey(node: Node): string | null {
    let searchNode: Node | null = node;
    while (searchNode && searchNode !== document.documentElement) {
        const key: string | null = getSelectionOffsetKeyForNode(searchNode);
        if (key != null) {
            return key;
        }
        searchNode = searchNode.parentNode;
    }

    return null;
}
