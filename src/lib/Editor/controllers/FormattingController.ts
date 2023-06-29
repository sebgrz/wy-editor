import { EventEmitter } from "eventemitter3";
import { ModifierType } from "..";

export enum FormattingEventType {
  BOLD,
  ITALICS,
  UNDERLINE,
  NONE
}

export type FormattingEvent = { type: FormattingEventType, isActive: boolean };

export type FormattingControllerActions = {
  bold: () => void;
  italics: () => void;
  underline: () => void;
}

export type FormattingState = {
  bold: boolean,
  italics: boolean,
  underline: boolean
}

const defaultFormattingState: FormattingState = { 
  bold: false,
  italics: false,
  underline: false
};

class FormattingController {
  public static readonly EE_TYPE = "formatting-event";
  public static readonly ST_TYPE = "state";
  private static _state: FormattingState = {
    bold: false,
    italics: false,
    underline: false
  };

  public set state(s: FormattingState) {
    FormattingController._state = s;
    this.eventEmitter.emit(FormattingController.ST_TYPE, s);
  }

  public get state(): FormattingState {
    return FormattingController._state;
  }

  constructor(public eventEmitter: EventEmitter) {
    FormattingController._state = { ...defaultFormattingState };
  }

  updateState = (modifiers: ModifierType[]) => {
    let newState: FormattingState = defaultFormattingState;
    for (let modifier of modifiers) {
      switch (modifier) {
        case ModifierType.BOLD:
          newState = { ...newState, bold: true };
          break;
        case ModifierType.ITALICS:
          newState = { ...newState, italics: true };
          break;
        case ModifierType.UNDERLINE:
          newState = { ...newState, underline: true };
          break;
      }
    }

    this.state = newState;
  }
}

export default FormattingController;
