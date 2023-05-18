import { EventEmitter } from "eventemitter3";

export enum FormattingEventType {
  BOLD,
  NONE
}

export type FormattingEvent = { type: FormattingEventType, isActive: boolean };

export type FormattingControllerActions = {
  bold: () => void;
}

type FormattingState = {
    bold: boolean
}

class FormattingController {
  public static readonly EE_TYPE = "formatting-event";
  public static state: FormattingState = {
    bold: false
  };

  constructor(public eventEmitter: EventEmitter) { }
}

export default FormattingController;
