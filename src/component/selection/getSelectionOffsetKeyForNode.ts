/**
 * 从节点或其子节点上获取第一个offsetKey
 * @param node 指定的DOM节点
 */
export function getSelectionOffsetKeyForNode(node: Node): string | null {
    if (node instanceof Element) {
        const offsetKey: string | null = node.getAttribute('data-offset-key');
        if (offsetKey) {
            return offsetKey;
        }

        for (let ii: number = 0; ii < node.childNodes.length; ii++) {
            const childOffsetKey: string | null = getSelectionOffsetKeyForNode(node.childNodes[ii] as Element);
            if (childOffsetKey) {
                return childOffsetKey;
            }
        }
    }

    return null;
}
