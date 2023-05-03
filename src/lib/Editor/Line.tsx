interface LineProps {
  cursorPosition: number;
  text: string;
}

const Line: React.FC<LineProps> = (props) => {
  return <div>{props.text}</div>
}

export default Line;
