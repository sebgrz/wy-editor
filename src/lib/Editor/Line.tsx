import { ReactElement } from "react";
import { FragmentModifier, ModifierType } from ".";
import { CSSProperties } from "react";

interface LineProps {
  cursorPosition: number; // TODO(optimize) - probably to remove
  text: string; // TODO(optimize) - to remove (only `fragmentMondifiers` should be enough
  fragmentModifiers: FragmentModifier[];
}

const Line: React.FC<LineProps> = (props) => {
  const prepareStyles = (modifierTypes: ModifierType[]): CSSProperties => {
    const css: CSSProperties = {};
    modifierTypes.forEach(f => {
      switch(f) {
        case ModifierType.BOLD:
          css.fontWeight = "bold";
        break;
      }
    });

    return css;
  }

  const renderFragments = (): ReactElement[] => {
    return props.fragmentModifiers.map(fragment => {
      return <div data-testid="wy-editor-line-fragment" style={prepareStyles(fragment.types)}>{fragment.text}</div>
    });
  }

  return <div data-testid="wy-editor-line-element" >{renderFragments()}</div>
}

export default Line;
