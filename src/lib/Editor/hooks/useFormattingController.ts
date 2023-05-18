import EventEmitter from "eventemitter3";
import FormattingController, { FormattingControllerActions, FormattingEvent, FormattingEventType } from "../controllers/FormattingController";


type FormattingControllerResult = [controller: FormattingController, actions: FormattingControllerActions];
const useFormattingController = (): FormattingControllerResult => {
  const eventEmitter = new EventEmitter();
  const controller = new FormattingController(eventEmitter);

  const actions: FormattingControllerActions = {
    bold: () => {
      if (!FormattingController.state.bold) {
        eventEmitter.emit(FormattingController.EE_TYPE, { type: FormattingEventType.BOLD, isActive: true } as FormattingEvent);
        FormattingController.state.bold = true;
      } else {
        eventEmitter.emit(FormattingController.EE_TYPE, { type: FormattingEventType.BOLD, isActive: false } as FormattingEvent);
        FormattingController.state.bold = false;
      }
    }
  }

  return [
    controller,
    actions
  ];
}
