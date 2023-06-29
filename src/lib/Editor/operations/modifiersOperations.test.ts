import { Modifier, ModifierType } from "..";
import { FormattingState } from "../controllers/FormattingController";
import { convertTextIntoFragments, createModifiers, mergeModifiers } from "./modifiersOperations";

describe("create modifiers", () => {
  test("should create BOLD modifier if state has active bold", () => {
    // given
    const position = 5;
    const state: FormattingState = {
      bold: true,
      italics: false,
      underline: false
    }

    // when
    const modifiers = createModifiers(state, position);

    // then
    expect(modifiers).toEqual([{ offset: 5, length: 1, type: ModifierType.BOLD }]);
  });

  test("should create both BOLD and UNDERLINE modifiers if state has active bold and underline", () => {
    // given
    const position = 5;
    const state: FormattingState = {
      bold: true,
      italics: false,
      underline: true
    }

    // when
    const modifiers = createModifiers(state, position);

    // then
    expect(modifiers).toEqual([
      { offset: 5, length: 1, type: ModifierType.BOLD },
      { offset: 5, length: 1, type: ModifierType.UNDERLINE }
    ]);
  });

  test("should not create BOLD modifier if state bold is not active", () => {
    // given
    const position = 5;
    const state: FormattingState = {
      bold: false,
      italics: false,
      underline: false
    }

    // when
    const modifiers = createModifiers(state, position);

    // then
    expect(modifiers).toEqual([]);
  });

  test("should not create any modifier if state is not exists", () => {
    // given
    const position = 5;
    const state = undefined;

    // when
    const modifiers = createModifiers(state, position);

    // then
    expect(modifiers).toEqual([]);
  });
});

describe("merge modifiers", () => {
  test("should not merge BOLD's modifiers if offset+length doesn't overlap", () => {
    // given
    const lineModifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 2, length: 3 },
      { type: ModifierType.BOLD, offset: 11, length: 2 },
    ];
    const newModifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 7, length: 2 },
    ];

    // when
    const modifiers = mergeModifiers(lineModifiers, newModifiers);

    // then
    expect(modifiers).toHaveLength(3);
  });

  test("should merge BOLD's overlaped modifiers - new has offset greater than old", () => {
    // given
    const lineModifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 2, length: 3 },
    ];
    const newModifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 4, length: 4 },
    ];

    // when
    const modifiers = mergeModifiers(lineModifiers, newModifiers);

    // then
    expect(modifiers).toHaveLength(1);
    expect(modifiers[0]).toEqual({ type: ModifierType.BOLD, offset: 2, length: 6 });
  });

  test("should merge BOLD's where old modifier is fully overlaped new one", () => {
    // given
    const lineModifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 2, length: 10 },
    ];
    const newModifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 3, length: 2 },
    ];

    // when
    const modifiers = mergeModifiers(lineModifiers, newModifiers);

    // then
    expect(modifiers).toHaveLength(1);
    expect(modifiers[0]).toEqual({ type: ModifierType.BOLD, offset: 2, length: 10 });
  });

  test("should merge BOLD's where new modifier is fully overlaped old one", () => {
    // given
    const lineModifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 3, length: 2 },
    ];
    const newModifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 2, length: 10 },
    ];

    // when
    const modifiers = mergeModifiers(lineModifiers, newModifiers);

    // then
    expect(modifiers).toHaveLength(1);
    expect(modifiers[0]).toEqual({ type: ModifierType.BOLD, offset: 2, length: 10 });
  });

  test("should merge BOLD's where new modifier is fully overlaped two old ones", () => {
    // given
    const lineModifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 3, length: 2 },
      { type: ModifierType.BOLD, offset: 7, length: 2 },
    ];
    const newModifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 2, length: 10 },
    ];

    // when
    const modifiers = mergeModifiers(lineModifiers, newModifiers);

    // then
    expect(modifiers).toHaveLength(1);
    expect(modifiers[0]).toEqual({ type: ModifierType.BOLD, offset: 2, length: 10 });
  });

  test("should merge BOLD's where new modifier is fully overlaped first old one and partly second old one", () => {
    // given
    const lineModifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 3, length: 2 },
      { type: ModifierType.BOLD, offset: 9, length: 5 }, // end - 14
    ];
    const newModifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 2, length: 10 },
    ];

    // when
    const modifiers = mergeModifiers(lineModifiers, newModifiers);

    // then
    expect(modifiers).toHaveLength(1);
    expect(modifiers[0]).toEqual({ type: ModifierType.BOLD, offset: 2, length: 12 }); // end - 14
  });

  test("should merge BOLD's not overlaped modifiers but new modifier has offset next to end of the old one", () => {
    // given
    const lineModifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 2, length: 3 }, // end - 5
    ];
    const newModifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 6, length: 4 }, // end - 10
    ];

    // when
    const modifiers = mergeModifiers(lineModifiers, newModifiers);

    // then
    expect(modifiers).toHaveLength(1);
    expect(modifiers[0]).toEqual({ type: ModifierType.BOLD, offset: 2, length: 8 }); // end - 10
  });

  test("should merge BOLD's not overlaped modifiers but old modifier has offset next to end of the new one", () => {
    // given
    const lineModifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 6, length: 4 }, // end - 10
    ];
    const newModifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 2, length: 3 }, // end - 5
    ];

    // when
    const modifiers = mergeModifiers(lineModifiers, newModifiers);

    // then
    expect(modifiers).toHaveLength(1);
    expect(modifiers[0]).toEqual({ type: ModifierType.BOLD, offset: 2, length: 8 }); // end - 10
  });

  test("should merge BOLD's not overlaped modifiers but new modifier is between the old ones", () => {
    // given
    const lineModifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 2, length: 3 }, // end - 5
      { type: ModifierType.BOLD, offset: 11, length: 2 }, // end - 13
    ];
    const newModifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 6, length: 4 }, // end - 10
    ];

    // when
    const modifiers = mergeModifiers(lineModifiers, newModifiers);

    // then
    expect(modifiers).toHaveLength(1);
    expect(modifiers[0]).toEqual({ type: ModifierType.BOLD, offset: 2, length: 11 }); // end - 13
  });

  test("should merge BOLD's overlaped modifiers - new has offset smaller than old", () => {
    // given
    const lineModifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 4, length: 4 },
    ];
    const newModifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 2, length: 3 },
    ];

    // when
    const modifiers = mergeModifiers(lineModifiers, newModifiers);

    // then
    expect(modifiers).toHaveLength(1);
    expect(modifiers[0]).toEqual({ type: ModifierType.BOLD, offset: 2, length: 6 });
  });

  test("should merge 2 BOLD's overlaped modifiers into one", () => {
    // given
    const lineModifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 2, length: 3 },
      { type: ModifierType.BOLD, offset: 6, length: 4 },
    ];
    const newModifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 4, length: 3 },
    ];

    // when
    const modifiers = mergeModifiers(lineModifiers, newModifiers);

    // then
    expect(modifiers).toHaveLength(1);
    expect(modifiers[0]).toEqual({ type: ModifierType.BOLD, offset: 2, length: 8 });
  });

  test("should keep modifiers when merge old BOLD modifier with empty new one", () => {
    // given
    const lineModifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 2, length: 3 },
    ];
    const newModifiers: Modifier[] = [];

    // when
    const modifiers = mergeModifiers(lineModifiers, newModifiers);

    // then
    expect(modifiers).toHaveLength(1);
    expect(modifiers[0]).toEqual({ type: ModifierType.BOLD, offset: 2, length: 3 });
  });
});

describe("generate fragments base on line modifiers", () => {
  const text = "Lorem ipsum"; // len: 11
  test("should generate two fragments with the second one BOLD modifier", () => {
    // given
    const modifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 8, length: 3 }
    ];

    // when
    const fragments = convertTextIntoFragments(text, modifiers);

    // then
    expect(fragments).toHaveLength(2);
    expect(fragments[0]).toEqual({ text: "Lorem ip", types: [] });
    expect(fragments[1]).toEqual({ text: "sum", types: [ModifierType.BOLD] });
  });

  test("should generate two fragments with the first one BOLD modifier", () => {
    // given
    const modifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 0, length: 3 }
    ];

    // when
    const fragments = convertTextIntoFragments(text, modifiers);

    // then
    expect(fragments).toHaveLength(2);
    expect(fragments[0]).toEqual({ text: "Lor", types: [ModifierType.BOLD] });
    expect(fragments[1]).toEqual({ text: "em ipsum", types: [] });
  });

  test("should generate three fragments with the second one BOLD modifier", () => {
    // given
    const modifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 2, length: 3 }
    ];

    // when
    const fragments = convertTextIntoFragments(text, modifiers);

    // then
    expect(fragments).toHaveLength(3);
    expect(fragments[0]).toEqual({ text: "Lo", types: [] });
    expect(fragments[1]).toEqual({ text: "rem", types: [ModifierType.BOLD] });
    expect(fragments[2]).toEqual({ text: " ipsum", types: [] });
  });

  test("should generate five fragments with two BOLD modifiers", () => {
    // given
    const modifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 2, length: 3 },
      { type: ModifierType.BOLD, offset: 7, length: 2 }
    ];

    // when
    const fragments = convertTextIntoFragments(text, modifiers);

    // then
    expect(fragments).toHaveLength(5);
    expect(fragments[0]).toEqual({ text: "Lo", types: [] });
    expect(fragments[1]).toEqual({ text: "rem", types: [ModifierType.BOLD] });
    expect(fragments[2]).toEqual({ text: " i", types: [] });
    expect(fragments[3]).toEqual({ text: "ps", types: [ModifierType.BOLD] });
    expect(fragments[4]).toEqual({ text: "um", types: [] });
  });

  test("should generate four fragments with both BOLD and UNDERLINE modifiers", () => {
    // given
    const modifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 8, length: 3 },
      { type: ModifierType.UNDERLINE, offset: 3, length: 2 },
    ];

    // when
    const fragments = convertTextIntoFragments(text, modifiers);

    // then
    expect(fragments).toHaveLength(4);
    expect(fragments[0]).toEqual({ text: "Lor", types: [] });
    expect(fragments[1]).toEqual({ text: "em", types:  [ModifierType.UNDERLINE]});
    expect(fragments[2]).toEqual({ text: " ip", types: [] });
    expect(fragments[3]).toEqual({ text: "sum", types: [ModifierType.BOLD] });
  });

  test("should generate four fragments with both BOLD and UNDERLINE modifiers and one fragment has combined both of them", () => {
    // given
    const modifiers: Modifier[] = [
      { type: ModifierType.BOLD, offset: 8, length: 3 },
      { type: ModifierType.UNDERLINE, offset: 6, length: 3 },
    ];

    // when
    const fragments = convertTextIntoFragments(text, modifiers);

    // then
    expect(fragments).toHaveLength(4);
    expect(fragments[0]).toEqual({ text: "Lorem ", types: [] });
    expect(fragments[1]).toEqual({ text: "ip", types: [ModifierType.UNDERLINE]});
    expect(fragments[2]).toEqual({ text: "s", types: [ModifierType.BOLD, ModifierType.UNDERLINE] });
    expect(fragments[3]).toEqual({ text: "um", types: [ModifierType.BOLD] });
  });
})
