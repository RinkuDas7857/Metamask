import React from 'react';
import { Footer } from '.';
import configureStore from '../../../../store/store';
import mockState from '../../../../../test/data/mock-state.json';
import { renderWithProvider } from '../../../../../test/jest';

const render = (optionalProps?: any) => {
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

  return renderWithProvider(<Footer {...optionalProps} />, store);
};

describe('ConfirmFooter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should match snapshot', async () => {
    const { container } = render();
    expect(container).toMatchSnapshot();
  });

  it('renders the correct text', () => {
    const { getAllByRole, getByText } = render();
    expect(getAllByRole('button')[0]).toBeInTheDocument();
    expect(getAllByRole('button')[1]).toBeInTheDocument();
    expect(getByText('Confirm')).toBeInTheDocument();
    expect(getByText('Cancel')).toBeInTheDocument();
  });

  it('disables the confirm button when disabled is true', () => {
    const propsWithDisabled = {
      confirmButtonProps: {
        disabled: true,
      },
    };

    const { getAllByRole } = render(propsWithDisabled);
    expect(getAllByRole('button')[1]).toBeDisabled();
    expect(getAllByRole('button')[0]).toBeEnabled();
  });

  it('styles the confirm button as danger when danger is true', () => {
    const propsWithDanger = {
      confirmButtonProps: {
        danger: true,
      },
    };
    const { getAllByRole } = render(propsWithDanger);
    expect(getAllByRole('button')[1]).toHaveClass(
      ' mm-box--background-color-error-default',
    );
    expect(getAllByRole('button')[0]).not.toHaveClass(
      ' mm-box--background-color-error-default',
    );
  });
});
