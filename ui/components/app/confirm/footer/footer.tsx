import React from 'react';
import {
  Box,
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../component-library';
import {
  BlockSize,
  Display,
  FlexDirection,
} from '../../../../helpers/constants/design-system';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { FooterProps } from './footer.types';
import { BoxProps } from '../../../component-library/box';
import classnames from 'classnames';

const Footer: React.FC<FooterProps> = ({
  className = '',
  confirmButtonProps,
  cancelButtonProps,
  ...props
}) => {
  const t = useI18nContext();
  return (
    <Box
      className={classnames('confirm-footer', className)}
      display={Display.Flex}
      flexDirection={FlexDirection.Row}
      gap={4}
      padding={4}
      width={BlockSize.Full}
      {...(props as BoxProps<'div'>)}
    >
      <Button
        block
        onClick={() => {}}
        data-testid="cancel-button"
        variant={ButtonVariant.Secondary}
        {...cancelButtonProps}
        size={ButtonSize.Lg || cancelButtonProps?.size}
      >
        {t('cancel')}
      </Button>
      <Button
        size={ButtonSize.Lg}
        block
        onClick={() => {}}
        data-testid="confirm-button"
        {...confirmButtonProps}
      >
        {t('confirm')}
      </Button>
    </Box>
  );
};

export default Footer;
