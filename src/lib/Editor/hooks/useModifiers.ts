import { CursorPosition, Modifier, ModifierType } from "..";
import { FormattingEvent } from "../controllers/FormattingController";

type ModifierData = Map<number, Map<ModifierType, Modifier>>;

type ModifierActionFunc = (line: number, position: number, event: FormattingEvent) => boolean; 
type ModifierSelectionActionFunc = (startPosition: CursorPosition, endPosition: CursorPosition, event: FormattingEvent) => boolean; 
type LineModifiersFunc = (line: number) => Modifier[];

type ModifiersResult = [ action: ModifierActionFunc, selectionAction: ModifierSelectionActionFunc, line: LineModifiersFunc];


const modifiers: ModifierData = new Map();

const useModifiers = (): ModifiersResult => {
  const modifierAction: ModifierActionFunc = (line: number, position: number, event: FormattingEvent) => {
    return false;
  }

  const modifierSelectionAction: ModifierSelectionActionFunc = (startPosition: CursorPosition, endPosition: CursorPosition, event: FormattingEvent) => {
    return false;
  }

  const lineModifiers: LineModifiersFunc = (line: number) => {
    return [];
  }

  return [ modifierAction, modifierSelectionAction, lineModifiers ];
}

export default useModifiers;
