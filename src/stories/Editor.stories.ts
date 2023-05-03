import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from '..';


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: 'Editor',
  component: Editor,
  tags: ['autodocs'],
} satisfies Meta<typeof Editor>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default: Story = {
  args: {
  },
};
