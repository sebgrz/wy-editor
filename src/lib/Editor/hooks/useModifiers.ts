import { CursorPosition, Modifier, ModifierType } from "..";
import { FormattingEvent, FormattingEventType } from "../controllers/FormattingController";

type ModifierData = Map<number, Map<ModifierType, Modifier>>;

type ModifierActionFunc = (line: number, position: number, event: FormattingEvent) => boolean;
type ModifierSelectionActionFunc = (startPosition: CursorPosition, endPosition: CursorPosition, event: FormattingEvent) => boolean;
type LineModifiersFunc = (line: number) => Modifier[];
type PositionModifiersFunc = (line: number, position: number) => Modifier[];

type ModifiersResult = [
  action: ModifierActionFunc, 
  selectionAction: ModifierSelectionActionFunc,
  lineModifiers: LineModifiersFunc,
  positionModifiers: PositionModifiersFunc
];


const modifiers: ModifierData = new Map();

const useModifiers = (): ModifiersResult => {
  const modifierAction: ModifierActionFunc = (line: number, position: number, event: FormattingEvent) => {
    let type = (() => {
      switch (event.type) {
        case FormattingEventType.BOLD: {
          return event.isActive ? ModifierType.START_BOLD : ModifierType.END_BOLD;
        }
      }
    })()

    if (type !== undefined) {
      if (modifiers.get(line)?.set(type, { position: position, type: type }) === undefined) {
        let modifiersLine = new Map<ModifierType, Modifier>();
        modifiersLine.set(type, { position: position, type: type });
        modifiers.set(line, modifiersLine);
      }
    }
    return false;
  }

  const modifierSelectionAction: ModifierSelectionActionFunc = (startPosition: CursorPosition, endPosition: CursorPosition, event: FormattingEvent) => {
    return false;
  }

  const lineModifiers: LineModifiersFunc = (line: number) => {    
    return [];
  }

  const positionModifiers: PositionModifiersFunc = (line: number, position: number) => {
    return [];
  }

  return [modifierAction, modifierSelectionAction, lineModifiers, positionModifiers];
}

export default useModifiers;
