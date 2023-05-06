interface LineProps {
  cursorPosition: number;
  text: string;
}

const Line: React.FC<LineProps> = (props) => {
  return <div data-testid="wy-editor-line-element" >{props.text}</div>
}

export default Line;
