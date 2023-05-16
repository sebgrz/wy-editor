import { FragmentModifier, Modifier, ModifierType } from "..";
import { FormattingState } from "../controllers/FormattingController";

export const createModifiers = (formattingState?: FormattingState, position: number): Modifier[] => {
  if (!formattingState) {
    return [];
  }

  let modifiers: Modifier[] = [];
  let { bold } = formattingState;

  bold && (
    modifiers.push({ offset: position, length: 1, type: ModifierType.BOLD })
  );

  return modifiers;
}

export const mergeModifiers = (lineModifiers: Modifier[], newModifiers: Modifier[]): Modifier[] => {
  let resultModifiers: Modifier[] = newModifiers.length !== 0 ? [] : lineModifiers;

  for (const modifier of newModifiers) {
    const modifierEndPosition = modifier.offset + modifier.length;
    const selectedNewModifiers = lineModifiers.filter(f =>
      f.type === modifier.type
      && (f.offset <= modifierEndPosition || f.offset <= modifierEndPosition + 1));
    const candidatesToMerge = selectedNewModifiers.filter(f =>
      f.offset >= modifier.offset
      || ((f.offset + f.length) >= (modifier.offset - 1) && (f.offset + f.length) <= modifierEndPosition)
      || (f.offset + f.length) >= modifierEndPosition);
    const others = lineModifiers.filter(f => !candidatesToMerge.some(s => s === f));

    if (candidatesToMerge.length > 0) {
      const temp = [...candidatesToMerge, modifier];
      const startPosition = Math.min(...temp.map(m => m.offset));
      const endPosition = Math.max(...temp.map(m => m.offset + m.length));
      const newModifier: Modifier = {
        offset: startPosition,
        length: endPosition - startPosition,
        type: ModifierType.BOLD
      };
      resultModifiers.push(newModifier);

      lineModifiers = lineModifiers.filter(m => !candidatesToMerge.some(s => s === m))
    } else {
      resultModifiers.push(modifier);
    }
    resultModifiers.push(...others);
  }

  return resultModifiers;
}

export const convertTextIntoFragments = (text: string, modifiers: Modifier[]): FragmentModifier[] => {
  const result: FragmentModifier[] = [];

  let fragmentStart = 0;
  let fragmentTypes: ModifierType[] = [];
  for (let idx = 0; idx < text.length; idx++) {
    let typesForCurrentIdx = modifiers
      .filter(f => idx >= f.offset && idx < f.offset + f.length)
      .map(m => m.type);
    if (idx === 0) {
      fragmentTypes = typesForCurrentIdx;
    } else if (fragmentTypes.length !== typesForCurrentIdx.length) {
      const fragmentEnd = idx === text.length - 1 ? idx + 1 : idx;
      const fragmentText = text.substring(fragmentStart, fragmentEnd);
      result.push({ text: fragmentText, types: fragmentTypes });

      fragmentTypes = typesForCurrentIdx;
      fragmentStart = idx;
    }
  }

  if (fragmentStart !== text.length - 1) {
    const fragmentEnd = text.length;
    const fragmentText = text.substring(fragmentStart, fragmentEnd);
    result.push({ text: fragmentText, types: fragmentTypes });
  }

  return result;
}
