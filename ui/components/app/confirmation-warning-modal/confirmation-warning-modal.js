import React from 'react';
import PropTypes from 'prop-types';
import { useI18nContext } from '../../../hooks/useI18nContext';

import {
  Display,
  FlexDirection,
  FontWeight,
  TextVariant,
  AlignItems,
  IconColor,
  TextAlign,
} from '../../../helpers/constants/design-system';

import {
  Box,
  Button,
  ButtonSize,
  ButtonVariant,
  Icon,
  IconName,
  IconSize,
  Modal,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '../../component-library';

const ConfirmationWarningModal = ({ onSubmit, onCancel }) => {
  const t = useI18nContext();
  return (
    <Modal
      isOpen
      onClose={onCancel}
      className="confirmation-warning-modal__content"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          childrenWrapperProps={{
            display: Display.Flex,
            flexDirection: FlexDirection.Column,
            alignItems: AlignItems.center,
            gap: 4,
          }}
        >
          <Icon
            name={IconName.Danger}
            color={IconColor.errorDefault}
            size={IconSize.Xl}
          />
          <Text
            variant={TextVariant.headingSm}
            as="h4"
            fontWeight={FontWeight.Bold}
            textAlign={TextAlign.Center}
          >
            {t('addEthereumChainWarningModalTitle')}
          </Text>
        </ModalHeader>
        <ModalBody>
          <Text marginTop={4} variant={TextVariant.bodySm}>
            {t('addEthereumChainWarningModalHeader', [
              <strong key="part-2">
                {t('addEthereumChainWarningModalHeaderPartTwo')}
              </strong>,
            ])}
          </Text>
          <Text marginTop={4} variant={TextVariant.bodySm}>
            {t('addEthereumChainWarningModalListHeader')}
          </Text>
          <ul>
            <Text as="li" marginTop={2} variant={TextVariant.bodySm}>
              {t('addEthereumChainWarningModalListPointOne')}
            </Text>
            <Text as="li" marginTop={2} variant={TextVariant.bodySm}>
              {t('addEthereumChainWarningModalListPointTwo')}
            </Text>
            <Text as="li" marginTop={2} variant={TextVariant.bodySm}>
              {t('addEthereumChainWarningModalListPointThree')}
            </Text>
          </ul>
        </ModalBody>
        <Box display={Display.Flex} gap={4}>
          <Button
            variant={ButtonVariant.Secondary}
            onClick={onCancel}
            block
            size={ButtonSize.Lg}
          >
            {t('reject')}
          </Button>
          <Button
            variant={ButtonVariant.Primary}
            onClick={onSubmit}
            danger
            block
            size={ButtonSize.Lg}
          >
            {t('approveButtonText')}
          </Button>
        </Box>
      </ModalContent>
    </Modal>
  );
};

ConfirmationWarningModal.propTypes = {
  /**
   * Function that approves collection
   */
  onSubmit: PropTypes.func,
  /**
   * Function that rejects collection
   */
  onCancel: PropTypes.func,
};

export default ConfirmationWarningModal;
