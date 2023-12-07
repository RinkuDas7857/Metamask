import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useI18nContext } from '../../../../hooks/useI18nContext';

import {
  Display,
  JustifyContent,
} from '../../../../helpers/constants/design-system';
import {
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Button,
  ButtonVariant,
  ButtonSize,
  Box,
} from '../../../component-library';

const DetectedTokenIgnoredPopover = ({
  partiallyIgnoreDetectedTokens,
  onCancelIgnore,
  handleClearTokensSelection,
  isOpen,
}) => {
  const t = useI18nContext();
  return (
    <Modal
      isOpen={isOpen}
      className={classNames('detected-token-ignored-popover', {
        'detected-token-ignored-popover--import': partiallyIgnoreDetectedTokens,
        'detected-token-ignored-popover--ignore':
          !partiallyIgnoreDetectedTokens,
      })}
      onClose={onCancelIgnore}
      autoFocus={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {partiallyIgnoreDetectedTokens
            ? t('importSelectedTokens')
            : t('areYouSure')}
        </ModalHeader>
        <ModalBody>
          <Text marginBottom={4}>
            {partiallyIgnoreDetectedTokens
              ? t('importSelectedTokensDescription')
              : t('ignoreTokenWarning')}
          </Text>
        </ModalBody>
        <Box
          display={Display.Flex}
          justifyContent={JustifyContent.center}
          gap={4}
          padding={4}
        >
          <Button
            className="detected-token-ignored-popover__ignore-button"
            block
            variant={ButtonVariant.Secondary}
            onClick={onCancelIgnore}
            size={ButtonSize.Lg}
          >
            {t('cancel')}
          </Button>
          <Button
            className="detected-token-ignored-popover__import-button"
            block
            variant={ButtonVariant.Primary}
            onClick={handleClearTokensSelection}
            size={ButtonSize.Lg}
          >
            {t('confirm')}
          </Button>
        </Box>
      </ModalContent>
    </Modal>
  );
};

DetectedTokenIgnoredPopover.propTypes = {
  partiallyIgnoreDetectedTokens: PropTypes.bool.isRequired,
  onCancelIgnore: PropTypes.func.isRequired,
  handleClearTokensSelection: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

export default DetectedTokenIgnoredPopover;
