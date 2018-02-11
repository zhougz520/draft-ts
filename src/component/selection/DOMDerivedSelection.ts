import { SelectionState } from '../model/immutable/SelectionState';

export interface IDOMDerivedSelection {
    selectionState: SelectionState;
    needsRecovery: boolean;
}
