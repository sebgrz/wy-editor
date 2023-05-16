import { useEffect, useState } from "react";
import Line from "./Line";
import FormattingController, { FormattingEvent } from "./controllers/FormattingController";

enum ModifierType {
  START_BOLD,
  END_BOLD
}

type Modifier = { position: number }

type LineData = { cursorPosition: number, text: string, modifiers: Map<ModifierType, Modifier> }

const createEmptyLine = (): LineData => {
  return { cursorPosition: 0, text: "", modifiers: new Map() };
}

const createLine = (position: number, text: string): LineData => {
  return { cursorPosition: position, text, modifiers: new Map() };
}

export type EditorProps = {
  formattingController?: FormattingController
}

const Editor: React.FC<EditorProps> = (props) => {
  // TODO: both bottoms to merge into one state
  const [lines, setLines] = useState<LineData[]>([createEmptyLine()])
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
    // TODO: to implementation
    console.info(event);
  }

  // TODO: refactor this
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.code) {
      case "Enter":
        let { cursorPosition, text } = lines[currentLine];
        let textForCurrentLine = text.slice(0, cursorPosition);
        let textForNewLine = text.slice(cursorPosition);
        let positionForNewLine = 0;
        lines[currentLine] = createLine(cursorPosition, textForCurrentLine);

        let updatedLines = [
          ...lines.slice(0, currentLine + 1),
          createLine(positionForNewLine, textForNewLine),
          ...lines.slice(currentLine + 1)
        ];
        setCurrentLine(currentLine + 1);
        setLines(updatedLines);
        setGlobalCursorPosition(positionForNewLine);
        break;
      case "ArrowUp": {
        let text = lines[currentLine].text;
        if (currentLine > 0) {
          let lineAbove = lines[currentLine - 1];
          if (globalCursorPosition > lineAbove.text.length) {
            lines[currentLine - 1] = createLine(lineAbove.text.length, lineAbove.text);
          } else {
            lines[currentLine - 1] = createLine(globalCursorPosition, lineAbove.text);
          }
          setCurrentLine(currentLine - 1);
          setLines([...lines]);
        } else { // as a first line, move curosor to the first postion
          lines[currentLine] = createLine(0, text);
          setLines([...lines]);
        }
        break;
      }
      case "ArrowDown": {
        let text = lines[currentLine].text;
        if (currentLine < lines.length - 1) {
          let lineBelow = lines[currentLine + 1];
          if (globalCursorPosition > lineBelow.text.length) {
            lines[currentLine + 1] = createLine(lineBelow.text.length, lineBelow.text);
          } else {
            lines[currentLine + 1] = createLine(globalCursorPosition, lineBelow.text);
          }
          setCurrentLine(currentLine + 1);
          setLines([...lines]);
        } else {
          lines[currentLine] = createLine(text.length, text);
          setLines([...lines]);
        }
        break;
      }
      case "ArrowRight": {
        let { cursorPosition, text } = lines[currentLine];
        let newPosition = cursorPosition + 1;
        if (newPosition > text.length && currentLine < lines.length - 1) {
          let text = lines[currentLine + 1].text;
          let newPosition = 0;
          lines[currentLine + 1] = createLine(newPosition, text);
          setLines([...lines]);
          setCurrentLine(currentLine + 1);
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
          setLines([...lines]);
        }

        break;
      }
      case "ArrowLeft": {
        let { cursorPosition, text } = lines[currentLine];
        let newPosition = cursorPosition - 1;
        if (newPosition < 0 && currentLine > 0) {
          let text = lines[currentLine - 1].text;
          let newPosition = text.length;
          lines[currentLine - 1] = createLine(newPosition, text);
          setLines([...lines]);
          setCurrentLine(currentLine - 1);
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
          setLines([...lines]);
        }
        break;
      }
      case "Backspace": {
        let { cursorPosition, text } = lines[currentLine];

        let newPosition = cursorPosition - 1;
        if (newPosition < 0 && currentLine > 0) {
          let otherLine = lines[currentLine - 1];
          let newPosition = otherLine.text.length;
          let newText = otherLine.text + text;
          lines[currentLine - 1] = createLine(newPosition, newText);
          let updatedLines = [
            ...lines.slice(0, currentLine),
            ...lines.slice(currentLine + 1)
          ]
          setLines(updatedLines);
          setCurrentLine(currentLine - 1);
          setGlobalCursorPosition(newPosition);
        } else {
          newPosition = newPosition < 0 ? 0 : newPosition;
          let newText = text.remove(cursorPosition);

          lines[currentLine] = createLine(newPosition, newText);
          setLines([...lines]);
          setGlobalCursorPosition(newPosition);
        }
        break;
      }
      default: {
        let char = event.key;
        let { cursorPosition, text } = lines[currentLine];
        let newPosition = cursorPosition + 1;
        lines[currentLine] = createLine(newPosition, text.insert(cursorPosition, char));
        setLines([...lines]);
        setGlobalCursorPosition(newPosition);
        break;
      }
    }
  }

  const renderLines = () => {
    return lines.map((l, i) => <Line key={i} {...l} />);
  }

  return <div data-testid="wy-editor-element" style={{ border: "1px solid black", width: "400px", height: "300px" }} tabIndex={-1} onKeyDown={handleKeyDown}>
    {renderLines()}
  </div>
}

export default Editor;
