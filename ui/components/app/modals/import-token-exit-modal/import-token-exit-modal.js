import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import * as actions from '../../../../store/actions';
import { DEFAULT_ROUTE } from '../../../../helpers/constants/routes';
import {
  Text,
  ButtonSecondary,
  ButtonPrimary,
  Box,
  Modal,
  ModalContent,
  ModalOverlay,
} from '../../../component-library';
import {
  TextAlign,
  FontWeight,
  TextVariant,
  Size,
  Display,
} from '../../../../helpers/constants/design-system';
import { useI18nContext } from '../../../../hooks/useI18nContext';

// export default function ImportTokensExitModal() {
export const ImportTokensExitModal = ({ onClose }) => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const history = useHistory();

  return (
    <Modal isOpen>
      <ModalOverlay />
      <ModalContent className="top-class">
        <Box>
          <Text
            textAlign={TextAlign.Center}
            fontWeight={FontWeight.Bold}
            variant={TextVariant.bodyMd}
          >
            {t('importExitHeader')}
          </Text>
          <Text
            marginTop={5}
            textAlign={TextAlign.Center}
            variant={TextVariant.bodyMd}
          >
            {t('importExitConfirmation')}
          </Text>

          <Box display={Display.Flex} marginTop={5} gap={4}>
            <ButtonSecondary
              data-testid="exit-token-confirmation__back"
              size={Size.LG}
              onClick={() => onClose()}
              block
            >
              {t('back')}
            </ButtonSecondary>
            <ButtonPrimary
              size={Size.LG}
              data-testid="exit-token-confirmation__confirm"
              onClick={() => {
                dispatch(actions.clearPendingTokens());
                onClose();
                dispatch(actions.hideImportTokensModal());
                history.push(DEFAULT_ROUTE);
              }}
              block
            >
              {t('confirm')}
            </ButtonPrimary>
          </Box>
        </Box>
      </ModalContent>
    </Modal>
  );
};

ImportTokensExitModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};
