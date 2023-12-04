import React from 'react';
import classnames from 'classnames';
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
import { BoxProps } from '../../../component-library/box';
import { FooterProps } from './footer.types';

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
        data-testid="confirm-button"
        {...confirmButtonProps}
      >
        {t('confirm')}
      </Button>
    </Box>
  );
};

export default Footer;
