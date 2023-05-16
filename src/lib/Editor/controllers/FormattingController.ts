import { EventEmitter } from "eventemitter3";

export enum FormattingEvent {
  BOLD,
  NONE
}

export type FormattingControllerActions = {
  bold: () => void;
}

class FormattingController {
  public static readonly EE_TYPE = "formatting-event";

  constructor(public eventEmitter: EventEmitter) { }
}

export default FormattingController;
