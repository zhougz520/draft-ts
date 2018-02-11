export type DraftEditorModes =
    /**
     * 'edit'是文本输入行为，包括删除、剪切、复制、粘贴
     */
    | 'edit'

    /**
     * `composite` mode handles IME text entry.
     */
    | 'composite'

    /**
     * 'drag'是拖动时编辑器处理行为
     */
    | 'drag'

    /**
     * `cut` mode allows us to effectively ignore all edit behaviors while the`
     * browser performs a native `cut` operation on the DOM.
     */
    | 'cut'

    /**
     * `render` mode is the normal "null" mode, during which no edit behavior is
     * expected or observed.
     */
    | 'render';
