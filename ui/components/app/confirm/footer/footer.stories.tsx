import React from 'react';
import type { StoryObj } from '@storybook/react';
import { Footer } from '.';
import configureStore from '../../../../store/store';
import mockState from '../../../../../test/data/mock-state.json';
import { Provider } from 'react-redux';

const store = configureStore({
  metamask: {
    ...mockState.metamask,
  },
  confirm: {
    currentConfirmation: {
      msgParams: {
        from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
      },
    },
  },
});

const Story = {
  title: 'Components/App/Confirm/Footer',
  component: Footer,
  parameters: {
    controls: { sort: 'alpha' },
  },
  argTypes: {
    cancelButtonProps: {
      control: 'object',
      description:
        'Props for the cancel button. See Button component for details',
    },
    confirmButtonProps: {
      control: 'object',
      description:
        'Props for the confirm button. See Button component for details',
    },
  },
  args: {},
  decorators: [(story: any) => <Provider store={store}>{story()}</Provider>],
};

export default Story;
type Story = StoryObj<typeof Footer>;

export const DefaultStory = () => <Footer />;

DefaultStory.name = 'Default';

export const CancelButtonButtonProps: Story = {
  args: {
    cancelButtonProps: { 'data-testid': 'cancel-button' },
  },
};

export const ConfirmButtonDisabledButtonProps: Story = {
  args: {
    confirmButtonProps: { disabled: true, 'data-testid': 'confirm-button' },
  },
};

export const ConfirmButtonDangerButtonProps: Story = {
  args: {
    confirmButtonProps: { danger: true, 'data-testid': 'confirm-button' },
  },
};
