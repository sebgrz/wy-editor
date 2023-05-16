import EventEmitter from "eventemitter3";
import FormattingController, { FormattingControllerActions, FormattingEvent, FormattingEventType, FormattingState } from "../controllers/FormattingController";
import { useRef } from "react";

type FormattingControllerResult = [controller: FormattingController, actions: FormattingControllerActions, state: FormattingState];

export const useFormattingController = (): FormattingControllerResult => {
  const eventEmitter = new EventEmitter();
  const controller = new FormattingController(eventEmitter);
  const state = useRef<FormattingState>(controller.state);

  const updateStateReceiver = (s: FormattingState) => {
    state.current = s;
  }

  const actions: FormattingControllerActions = {
    bold: () => {
      if (!controller.state.bold) {
        eventEmitter.emit(FormattingController.EE_TYPE, { type: FormattingEventType.BOLD, isActive: true } as FormattingEvent);
        controller.state = {...controller.state, bold: true }
      } else {
        eventEmitter.emit(FormattingController.EE_TYPE, { type: FormattingEventType.BOLD, isActive: false } as FormattingEvent);
        controller.state = {...controller.state, bold: false }
      }
    }
  }

  eventEmitter.on(FormattingController.ST_TYPE, updateStateReceiver);

  return [
    controller,
    actions,
    state.current!!
  ];
}
