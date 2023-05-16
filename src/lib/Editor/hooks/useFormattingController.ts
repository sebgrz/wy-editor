import EventEmitter from "eventemitter3";
import FormattingController, { FormatingEvent, FormattingControllerActions } from "../controllers/FormattingController";

type FormattingControllerResult = [ controller: FormattingController, actions: FormattingControllerActions ]; 

const useFormattingController = (): FormattingControllerResult => {
  const eventEmitter = new EventEmitter();
  const controller = new FormattingController(eventEmitter);

  const actions: FormattingControllerActions = {
    bold: () => {
      eventEmitter.emit(FormattingController.EE_TYPE, FormatingEvent.BOLD);
    }
  }

  return [
    controller,
    actions
  ];
}
