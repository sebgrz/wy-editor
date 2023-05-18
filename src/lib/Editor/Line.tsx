import { Modifier } from ".";

interface LineProps {
  cursorPosition: number;
  text: string;
  modifiers: Modifier[];
}

const Line: React.FC<LineProps> = (props) => {
  return <div data-testid="wy-editor-line-element" >{props.text}</div>
}

export default Line;
