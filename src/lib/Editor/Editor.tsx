import { useEffect, useState } from "react";
import Line from "./Line";
import FormattingController, { FormattingEvent } from "./controllers/FormattingController";
import { Modifier } from ".";
import { convertTextIntoFragments, createModifiers, mergeModifiers } from "./operations/modifiersOperations";

type LineData = { cursorPosition: number, text: string, modifiers: Modifier[] }

const createEmptyLine = (): LineData => {
  return { cursorPosition: 0, text: "", modifiers: [] };
}

const createLine = (position: number, text: string, modifiers: Modifier[] | undefined = undefined): LineData => {
  const m = modifiers ? modifiers : [];
  return { cursorPosition: position, text, modifiers: m };
}

export type EditorProps = {
  formattingController?: FormattingController
}

const Editor: React.FC<EditorProps> = (props) => {
  // TODO: both bottoms to merge into one state
  const [lines, setLines] = useState<LineData[]>([createEmptyLine()]);
  const [currentLine, setCurrentLine] = useState(0);
  const [globalCursorPosition, setGlobalCursorPosition] = useState(0);

  useEffect(() => {
    console.info(JSON.stringify(lines));
  }, [lines]);

  useEffect(() => {
    console.info(`globalCursorPosition: ${globalCursorPosition}`);
  }, [globalCursorPosition]);

  useEffect(() => {
    props.formattingController?.eventEmitter.on(FormattingController.EE_TYPE, formattingEventsReceiver);
  }, [props.formattingController]);

  const formattingEventsReceiver = (event: FormattingEvent) => {
    console.info(`l: ${currentLine} p: ${globalCursorPosition} e: ${event}`);
    // TODO: check here isSelection
  }

  // TODO: refactor this
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    let updatedLines: LineData[] = [];
    let updatedCurrentLine = 0;
    switch (event.code) {
      case "Enter":
        let { cursorPosition, text } = lines[currentLine];
        let textForCurrentLine = text.slice(0, cursorPosition);
        let textForNewLine = text.slice(cursorPosition);
        let positionForNewLine = 0;
        lines[currentLine] = createLine(cursorPosition, textForCurrentLine);

        updatedLines = [
          ...lines.slice(0, currentLine + 1),
          createLine(positionForNewLine, textForNewLine),
          ...lines.slice(currentLine + 1)
        ];
        updatedCurrentLine = currentLine + 1;
        setGlobalCursorPosition(positionForNewLine);
        break;
      case "ArrowUp": {
        let text = lines[currentLine].text;
        updatedCurrentLine = currentLine;
        if (currentLine > 0) {
          let lineAbove = lines[currentLine - 1];
          if (globalCursorPosition > lineAbove.text.length) {
            lines[currentLine - 1] = createLine(lineAbove.text.length, lineAbove.text);
          } else {
            lines[currentLine - 1] = createLine(globalCursorPosition, lineAbove.text);
          }
          updatedCurrentLine = currentLine - 1;
        } else { // as a first line, move curosor to the first postion
          lines[currentLine] = createLine(0, text);
        }
        updatedLines = [...lines];
        break;
      }
      case "ArrowDown": {
        let text = lines[currentLine].text;
        updatedCurrentLine = currentLine;
        if (currentLine < lines.length - 1) {
          let lineBelow = lines[currentLine + 1];
          if (globalCursorPosition > lineBelow.text.length) {
            lines[currentLine + 1] = createLine(lineBelow.text.length, lineBelow.text);
          } else {
            lines[currentLine + 1] = createLine(globalCursorPosition, lineBelow.text);
          }
          updatedCurrentLine = currentLine + 1;
        } else {
          lines[currentLine] = createLine(text.length, text);
        }
        updatedLines = [...lines];
        break;
      }
      case "ArrowRight": {
        let { cursorPosition, text } = lines[currentLine];
        updatedCurrentLine = currentLine;
        let newPosition = cursorPosition + 1;
        if (newPosition > text.length && currentLine < lines.length - 1) {
          let text = lines[currentLine + 1].text;
          let newPosition = 0;
          lines[currentLine + 1] = createLine(newPosition, text);
          updatedCurrentLine = currentLine + 1;
          setGlobalCursorPosition(newPosition);
        } else {
          newPosition = (() => {
            if (newPosition > text.length) {
              return text.length;
            } else {
              setGlobalCursorPosition(newPosition);
              return newPosition;
            }
          })()
          lines[currentLine] = createLine(newPosition, text);
        }

        updatedLines = [...lines];
        break;
      }
      case "ArrowLeft": {
        let { cursorPosition, text } = lines[currentLine];
        updatedCurrentLine = currentLine;
        let newPosition = cursorPosition - 1;
        if (newPosition < 0 && currentLine > 0) {
          let text = lines[currentLine - 1].text;
          let newPosition = text.length;
          lines[currentLine - 1] = createLine(newPosition, text);
          updatedCurrentLine = currentLine - 1;
          setGlobalCursorPosition(newPosition);
        } else {
          newPosition = (() => {
            if (newPosition < 0) {
              return 0;
            } else {
              setGlobalCursorPosition(newPosition);
              return newPosition;
            }
          })()
          lines[currentLine] = createLine(newPosition, text);
        }
        updatedLines = [...lines];
        break;
      }
      case "Backspace": {
        let { cursorPosition, text } = lines[currentLine];
        updatedCurrentLine = currentLine;

        let newPosition = cursorPosition - 1;
        if (newPosition < 0 && currentLine > 0) {
          let otherLine = lines[currentLine - 1];
          let newPosition = otherLine.text.length;
          let newText = otherLine.text + text;
          lines[currentLine - 1] = createLine(newPosition, newText);
          updatedLines = [
            ...lines.slice(0, currentLine),
            ...lines.slice(currentLine + 1)
          ]
          updatedCurrentLine = currentLine - 1;
          setGlobalCursorPosition(newPosition);
        } else {
          newPosition = newPosition < 0 ? 0 : newPosition;
          let newText = text.remove(cursorPosition);

          lines[currentLine] = createLine(newPosition, newText);
          updatedLines = [...lines];
          setGlobalCursorPosition(newPosition);
        }
        break;
      }
      default: {
        let char = event.key;
        let { cursorPosition, text, modifiers } = lines[currentLine];
        updatedCurrentLine = currentLine;
        let newPosition = cursorPosition + 1;
        lines[currentLine] = createLine(newPosition, text.insert(cursorPosition, char), modifiers);
        setGlobalCursorPosition(newPosition);
        updatedLines = [...lines];
        break;
      }
    }
    // TODO:`createLine - add modifiers parameter everywhere

    // Modifiers pipeline
    const line = updatedLines[updatedCurrentLine]
    const lineModifiers = line.modifiers;
    const newModifiers = createModifiers(props.formattingController?.state, globalCursorPosition);
    console.debug("State: " + JSON.stringify(props.formattingController?.state));
    console.debug("New modifiers: " + JSON.stringify(newModifiers));
    const modifiers = mergeModifiers(lineModifiers, newModifiers);
    console.debug("Line modifiers: \n" + JSON.stringify(lineModifiers) + "\nMerged modifiers: \n" + JSON.stringify(modifiers));
    
    updatedLines[updatedCurrentLine] = { ...line, modifiers: modifiers };

    setLines(updatedLines);
    setCurrentLine(updatedCurrentLine);
  }

  const renderLines = () => {
    // TODO(optimize): `convertTextIntoFragments` to optimize - process only modified line
    return lines.map((l, i) => <Line key={i} {...l} fragmentModifiers={convertTextIntoFragments(l.text, l.modifiers)} />);
  }

  return <div data-testid="wy-editor-element" style={{ border: "1px solid black", width: "400px", height: "300px" }} tabIndex={-1} onKeyDown={handleKeyDown}>
    {renderLines()}
  </div>
}

export default Editor;
