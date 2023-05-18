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
  START_BOLD,
  END_BOLD
}

export type Modifier = { position: number, type: ModifierType };
export type CursorPosition = { line: number, position: number }; 
