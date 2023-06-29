export { default } from "./Editor";

declare global {
  interface String {
    insert(position: number, str: string): string;
    remove(position: number): string
  }
}

String.prototype.insert = function(position: number, str: string) {
  return (position > 0) ? this.substring(0, position) + str + this.substring(position) : str + this;
};

String.prototype.remove = function(position: number) {
  return (position > 0) ? this.substring(0, position - 1) + this.substring(position) : this + "";
};

export enum ModifierType {
  BOLD,
  ITALICS,
  UNDERLINE
}

export type Modifier = { offset: number, length: number, type: ModifierType };
export type FragmentModifier = { text: string, types: ModifierType[] };
export type CursorPosition = { line: number, position: number };

