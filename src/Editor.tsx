import { useEffect, useState } from "react";

const Editor: React.FC<{}> = () => {
  const [text, setText] = useState("");

  useEffect(() => {
    console.info(text);
  }, [text]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    let char = (() => {
      switch (event.code) {
        case "Enter":
          return "\n";
        default:
          return event.key;
      }
    })();

    setText(text + char);
  }

  return <div style={{ border: "1px solid black", width: "400px", height: "300px" }} tabIndex={-1} onKeyDown={handleKeyDown}>
  </div>
}

export default Editor;
