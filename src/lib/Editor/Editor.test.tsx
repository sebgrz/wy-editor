import { waitFor, render, RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import '@testing-library/jest-dom'
import Editor from ".";

beforeEach(() => {
	userEvent.setup();
});

describe("editor render lines", () => {
	test("display empty line when focus is not catched", async () => {
		let component = render(<Editor />);
		let editor = await component.findByTestId("wy-editor-element");
		await waitFor(async () => {
			// text
			await userEvent.keyboard("abc");
		});
		let lines = await component.findAllByTestId("wy-editor-line-element");

		expect(editor).toHaveTextContent("");
		expect(lines).toHaveLength(1);

	});

	test('display one line with content after catch focus and enter some text', async () => {
		let component = render(<Editor />);
		let editor = await component.findByTestId("wy-editor-element");

		await waitFor(async () => {
			// set focus
			await userEvent.click(editor);
			// text
			await userEvent.keyboard("abc");
		});
		let lines = await component.findAllByTestId("wy-editor-line-element");

		expect(editor).toHaveTextContent("abc");
		expect(lines).toHaveLength(1);
	});

	test('display multiple lines with content after catch focus and enter some text', async () => {
		let component = render(<Editor />);
		let editor = await component.findByTestId("wy-editor-element");

		await waitFor(async () => {
			// set focus
			await userEvent.click(editor);
			// text
			await userEvent.keyboard("abc");
			await userEvent.type(editor, "{enter}");
			await userEvent.keyboard("123");
			await userEvent.type(editor, "{enter}");
		});

		let lines = await component.findAllByTestId("wy-editor-line-element");

		expect(editor).toHaveTextContent("abc123");
		expect(lines).toHaveLength(3);
		["abc", "123", ""].forEach((v, i) => {
			expect(lines[i]).toHaveTextContent(v);
		});
	});
});

describe("left cursor moving", () => {
	test("left arrow at the end of text let move cursor to the left", async () => {
		let [editor, component] = await prepareComponent();
		await waitFor(async () => {
			// text
			await userEvent.keyboard("abc");
			await userEvent.type(editor, "{ArrowLeft}");
			await userEvent.keyboard("1");
		});

		let lines = await component.findAllByTestId("wy-editor-line-element");

		expect(editor).toHaveTextContent("ab1c");
		expect(lines).toHaveLength(1);
	});

	test("pressing multiple left arrow let move cursor to the line above", async () => {
		let [editor, component] = await prepareComponent();
		await waitFor(async () => {
			await userEvent.keyboard("abc");
			await userEvent.type(editor, "{Enter}");
			await userEvent.type(editor, "def");
			await userEvent.type(editor, "{ArrowLeft}");
			await userEvent.type(editor, "{ArrowLeft}");
			await userEvent.type(editor, "{ArrowLeft}");
			await userEvent.type(editor, "{ArrowLeft}");
			await userEvent.type(editor, "{ArrowLeft}");
			await userEvent.type(editor, "1");
		});

		let lines = await component.findAllByTestId("wy-editor-line-element");

		expect(editor).toHaveTextContent("ab1cdef");
		expect(lines).toHaveLength(2);
	});

	test("pressing multiple left arrow should never exceed first position", async () => {
		let [editor] = await prepareComponent();

		await waitFor(async () => {
			await userEvent.keyboard("abc");
			await userEvent.type(editor, "{ArrowLeft}"); // c
			await userEvent.type(editor, "{ArrowLeft}"); // b
			await userEvent.type(editor, "{ArrowLeft}"); // a 

			// beyond the first position
			await userEvent.type(editor, "{ArrowLeft}");
			await userEvent.type(editor, "{ArrowLeft}");

			await userEvent.type(editor, "1");
		});

		expect(editor).toHaveTextContent("1abc");
	});
});

describe("right cursor moving", () => {
	test("press right arrow at the end of document should stop cursor moving", async () => {
		let [editor] = await prepareComponent();

		await waitFor(async () => {
			await userEvent.keyboard("abc");
			await userEvent.type(editor, "{ArrowLeft}"); // c
			await userEvent.type(editor, "{ArrowLeft}"); // b

			await userEvent.type(editor, "{ArrowRight}");
			await userEvent.type(editor, "{ArrowRight}");
			await userEvent.type(editor, "{ArrowRight}"); // over end

			await userEvent.type(editor, "1");
		});

		expect(editor).toHaveTextContent("abc1");
	});

	test("pressing multiple right arrow from first line should move cursor to the second one", async () => {
		let [editor] = await prepareComponent();

		await waitFor(async () => {
			await userEvent.keyboard("abc");
			await userEvent.type(editor, "{Enter}");
			await userEvent.keyboard("def");
			await userEvent.type(editor, "{ArrowLeft}"); // f
			await userEvent.type(editor, "{ArrowLeft}"); // e
			await userEvent.type(editor, "{ArrowLeft}"); // d
			await userEvent.type(editor, "{ArrowLeft}"); // d
			await userEvent.type(editor, "{ArrowLeft}"); // c
			await userEvent.type(editor, "{ArrowLeft}"); // b

			await userEvent.type(editor, "{ArrowRight}");
			await userEvent.type(editor, "{ArrowRight}");
			await userEvent.type(editor, "{ArrowRight}");
			await userEvent.type(editor, "{ArrowRight}");

			await userEvent.type(editor, "1");
		});

		expect(editor).toHaveTextContent("abcd1ef");
	});
});

describe("up/down cursor moving should keep line position", () => {
	test("two lines - first longer - start end of second line - arrow up should move cursor to the same position", async () => {
		let [editor] = await prepareComponent();

		await waitFor(async () => {
			await userEvent.keyboard("abcd");
			await userEvent.type(editor, "{Enter}");
			await userEvent.keyboard("efg");
			await userEvent.type(editor, "{ArrowUp}");

			await userEvent.type(editor, "1");
		});

		expect(editor).toHaveTextContent("abc1defg");
	});

	test("two lines - first shorter - start end of second line - arrow up and then arrow down should back cursor to the same position (end line)", async () => {
		let [editor] = await prepareComponent();

		await waitFor(async () => {
			await userEvent.keyboard("abc");
			await userEvent.type(editor, "{Enter}");
			await userEvent.keyboard("defgh");
			await userEvent.type(editor, "{ArrowUp}");
			await userEvent.type(editor, "{ArrowDown}");

			await userEvent.type(editor, "1");
		});

		expect(editor).toHaveTextContent("abcdefgh1");
	});

	test("two lines - first shorter - start end of second line - arrow left/right should assign new global position in up/down movement", async () => {
		let [editor] = await prepareComponent();

		await waitFor(async () => {
			await userEvent.keyboard("abc");
			await userEvent.type(editor, "{Enter}");
			await userEvent.keyboard("defgh");
			await userEvent.type(editor, "{ArrowUp}");

			await userEvent.type(editor, "{ArrowLeft}"); // new global position - 2

			await userEvent.type(editor, "{ArrowDown}");

			await userEvent.type(editor, "1");
		});

		expect(editor).toHaveTextContent("abcde1fgh");
	});

	test("two lines - first shorter - start end of second line - twice arrow up should set cursor on first position of first line", async () => {
		let [editor] = await prepareComponent();

		await waitFor(async () => {
			await userEvent.keyboard("abc");
			await userEvent.type(editor, "{Enter}");
			await userEvent.keyboard("defgh");
			await userEvent.type(editor, "{ArrowUp}");
			await userEvent.type(editor, "{ArrowUp}");

			await userEvent.type(editor, "1");
		});

		expect(editor).toHaveTextContent("1abcdefgh");
	});

	test("two lines - first shorter - start end of second line - twice arrow up and then arrow down should back to the previous position of second line", async () => {
		let [editor] = await prepareComponent();

		await waitFor(async () => {
			await userEvent.keyboard("abc");
			await userEvent.type(editor, "{Enter}");
			await userEvent.keyboard("defgh");
			await userEvent.type(editor, "{ArrowLeft}");
			await userEvent.type(editor, "{ArrowUp}");
			await userEvent.type(editor, "{ArrowUp}");
			await userEvent.type(editor, "{ArrowDown}");

			await userEvent.type(editor, "1");
		});

		expect(editor).toHaveTextContent("abcdefg1h");
	});

	test("two lines - first longer - start end of second line - arrow down should set last position of second line", async () => {
		let [editor] = await prepareComponent();

		await waitFor(async () => {
			await userEvent.keyboard("abcde");
			await userEvent.type(editor, "{Enter}");
			await userEvent.keyboard("fgh");
			await userEvent.type(editor, "{ArrowLeft}");
			await userEvent.type(editor, "{ArrowUp}");
			await userEvent.type(editor, "{ArrowRight}");
			await userEvent.type(editor, "{ArrowRight}");
			await userEvent.type(editor, "{ArrowRight}");
			await userEvent.type(editor, "{ArrowDown}");

			await userEvent.type(editor, "1");
		});

		expect(editor).toHaveTextContent("abcdefgh1");
	});

	test("two lines - first longer - start from the center of first line - twice arrow down should set cursor on last position of the second line", async () => {
		let [editor] = await prepareComponent();

		await waitFor(async () => {
			await userEvent.keyboard("abcde");
			await userEvent.type(editor, "{Enter}");
			await userEvent.keyboard("fgh");
			await userEvent.type(editor, "{ArrowUp}");
			await userEvent.type(editor, "{ArrowLeft}");
			await userEvent.type(editor, "{ArrowDown}");
			await userEvent.type(editor, "{ArrowDown}");

			await userEvent.type(editor, "1");
		});

		expect(editor).toHaveTextContent("abcdefgh1");
	});

	test("two lines - first longer - start from the center of first line - twice arrow down and then up should back to the previous cursor position of first line", async () => {
		let [editor] = await prepareComponent();

		await waitFor(async () => {
			await userEvent.keyboard("abcde");
			await userEvent.type(editor, "{Enter}");
			await userEvent.keyboard("fgh");
			await userEvent.type(editor, "{ArrowUp}");
			await userEvent.type(editor, "{ArrowLeft}");
			await userEvent.type(editor, "{ArrowDown}");
			await userEvent.type(editor, "{ArrowDown}");
			await userEvent.type(editor, "{ArrowUp}");

			await userEvent.type(editor, "1");
		});

		expect(editor).toHaveTextContent("ab1cdefgh");
	});
});

describe("backspace", () => {
	test("push multiple backspace should remove all content and keep one empty line", async () => {
		let [editor, component] = await prepareComponent();

		await waitFor(async () => {
			await userEvent.keyboard("ab");
			await userEvent.type(editor, "{Enter}");
			await userEvent.keyboard("12");
			await userEvent.type(editor, "{Backspace}");
			await userEvent.type(editor, "{Backspace}");
			await userEvent.type(editor, "{Backspace}");
			await userEvent.type(editor, "{Backspace}");
			await userEvent.type(editor, "{Backspace}");
			await userEvent.type(editor, "{Backspace}");
		});

		let lines = await component.findAllByTestId("wy-editor-line-element");
		expect(editor).toHaveTextContent("");
		expect(lines).toHaveLength(1);
	});

	test("push backspace at the beginning of second line should merge both lines", async () => {
		let [editor, component] = await prepareComponent();

		await waitFor(async () => {
			await userEvent.keyboard("ab");
			await userEvent.type(editor, "{Enter}");
			await userEvent.keyboard("12");
			await userEvent.type(editor, "{ArrowLeft}");
			await userEvent.type(editor, "{ArrowLeft}");
			await userEvent.type(editor, "{Backspace}");
		});

		let lines = await component.findAllByTestId("wy-editor-line-element");
		expect(editor).toHaveTextContent("ab12");
		expect(lines).toHaveLength(1);
	});
});

describe("enter", () => {
	test("push enter in the center of line should split line to two line", async () => {
		let [editor, component] = await prepareComponent();

		await waitFor(async () => {
			await userEvent.keyboard("ab12");
			await userEvent.type(editor, "{ArrowLeft}");
			await userEvent.type(editor, "{ArrowLeft}");
			await userEvent.type(editor, "{Enter}");
		});

		let lines = await component.findAllByTestId("wy-editor-line-element");
		expect(lines).toHaveLength(2);
		expect(lines[0]).toHaveTextContent("ab");
		expect(lines[1]).toHaveTextContent("12");
	});
});

async function prepareComponent(): Promise<[HTMLElement, RenderResult]> {
	let component = render(<Editor />);
	let editor = await component.findByTestId("wy-editor-element");

	await waitFor(async () => {
		await userEvent.click(editor);
	});

	return [editor, component];
}
