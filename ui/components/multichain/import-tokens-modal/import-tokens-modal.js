import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getTokenTrackerLink } from '@metamask/etherscan-link/dist/token-tracker-link';
import { Tab, Tabs } from '../../ui/tabs';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  getCurrentChainId,
  getIsDynamicTokenListAvailable,
  getIsMainnet,
  getIsTokenDetectionInactiveOnMainnet,
  getIsTokenDetectionSupported,
  getIstokenDetectionInactiveOnNonMainnetSupportedNetwork,
  getMetaMaskIdentities,
  getRpcPrefsForCurrentProvider,
  getSelectedAddress,
  getSelectedNetworkClientId,
  getTokenDetectionSupportNetworkByChainId,
  getTokenList,
  getCurrentNetwork,
  getTestNetworkBackgroundColor,
} from '../../../selectors';
import {
  addImportedTokens,
  clearPendingTokens,
  getTokenStandardAndDetails,
  setPendingTokens,
  showImportNftsModal,
  showImportTokensExitModal,
  setNewTokensImported,
  setNewTokensImportedError,
  hideImportTokensModal,
} from '../../../store/actions';
import {
  BannerAlert,
  Box,
  ButtonLink,
  ButtonPrimary,
  FormTextField,
  Modal,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  ButtonSecondary,
} from '../../component-library';
import TokenSearch from '../../app/import-token/token-search';
import TokenList from '../../app/import-token/token-list';

import {
  Display,
  FontWeight,
  Severity,
  Size,
  TextAlign,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';

import {
  SECURITY_ROUTE,
  DEFAULT_ROUTE,
} from '../../../helpers/constants/routes';
import ZENDESK_URLS from '../../../helpers/constants/zendesk-url';
import { isValidHexAddress } from '../../../../shared/modules/hexstring-utils';
import { addHexPrefix } from '../../../../app/scripts/lib/util';
import { STATIC_MAINNET_TOKEN_LIST } from '../../../../shared/constants/tokens';
import {
  AssetType,
  TokenStandard,
} from '../../../../shared/constants/transaction';
import {
  checkExistingAddresses,
  getURLHostName,
} from '../../../helpers/utils/util';
import { tokenInfoGetter } from '../../../helpers/utils/token-util';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import { getPendingTokens } from '../../../ducks/metamask/metamask';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
  MetaMetricsTokenEventSource,
} from '../../../../shared/constants/metametrics';
import { getMostRecentOverviewPage } from '../../../ducks/history/history';
import { ImportTokensModalConfirm } from './import-tokens-modal-confirm';

export const ImportTokensModal = ({ onClose }) => {
  const t = useI18nContext();
  const history = useHistory();
  const dispatch = useDispatch();

  const [mode, setMode] = useState('');

  const [tokenSelectorError, setTokenSelectorError] = useState(null);
  const [selectedTokens, setSelectedTokens] = useState({});
  const [searchResults, setSearchResults] = useState([]);

  // Determine if we should show the search tab
  const isTokenDetectionSupported = useSelector(getIsTokenDetectionSupported);
  const isTokenDetectionInactiveOnMainnet = useSelector(
    getIsTokenDetectionInactiveOnMainnet,
  );
  const showSearchTab =
    isTokenDetectionSupported ||
    isTokenDetectionInactiveOnMainnet ||
    Boolean(process.env.IN_TEST);

  const tokenList = useSelector(getTokenList);
  const useTokenDetection = useSelector(
    ({ metamask }) => metamask.useTokenDetection,
  );
  const networkName = useSelector(getTokenDetectionSupportNetworkByChainId);
  const mostRecentOverviewPage = useSelector(getMostRecentOverviewPage);

  // Custom token stuff
  const tokenDetectionInactiveOnNonMainnetSupportedNetwork = useSelector(
    getIstokenDetectionInactiveOnNonMainnetSupportedNetwork,
  );
  const isDynamicTokenListAvailable = useSelector(
    getIsDynamicTokenListAvailable,
  );
  const selectedAddress = useSelector(getSelectedAddress);
  const isMainnet = useSelector(getIsMainnet);
  const identities = useSelector(getMetaMaskIdentities);
  const tokens = useSelector((state) => state.metamask.tokens);
  const rpcPrefs = useSelector(getRpcPrefsForCurrentProvider);

  const [customAddress, setCustomAddress] = useState('');
  const [customAddressError, setCustomAddressError] = useState(null);
  const [nftAddressError, setNftAddressError] = useState(null);
  const [symbolAutoFilled, setSymbolAutoFilled] = useState(false);
  const [decimalAutoFilled, setDecimalAutoFilled] = useState(false);
  const [mainnetTokenWarning, setMainnetTokenWarning] = useState(null);
  const [customSymbol, setCustomSymbol] = useState('');
  const [customName, setCustomName] = useState('');
  const [customSymbolError, setCustomSymbolError] = useState(null);
  const [customDecimals, setCustomDecimals] = useState(0);
  const [customDecimalsError, setCustomDecimalsError] = useState(null);
  const [tokenStandard, setTokenStandard] = useState(TokenStandard.none);
  const [forceEditSymbol, setForceEditSymbol] = useState(false);
  const currentNetwork = useSelector(getCurrentNetwork);
  const testNetworkBackgroundColor = useSelector(getTestNetworkBackgroundColor);

  const chainId = useSelector(getCurrentChainId);
  const blockExplorerTokenLink = getTokenTrackerLink(
    customAddress,
    chainId,
    null,
    null,
    { blockExplorerUrl: rpcPrefs?.blockExplorerUrl ?? null },
  );
  const blockExplorerLabel = rpcPrefs?.blockExplorerUrl
    ? getURLHostName(blockExplorerTokenLink)
    : t('etherscan');

  // Min and Max decimal values
  const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';
  const MIN_DECIMAL_VALUE = 0;
  const MAX_DECIMAL_VALUE = 36;

  const infoGetter = useRef(tokenInfoGetter());

  // CONFIRMATION MODE
  const trackEvent = useContext(MetaMetricsContext);
  const pendingTokens = useSelector(getPendingTokens);
  const networkClientId = useSelector(getSelectedNetworkClientId);

  const handleAddTokens = useCallback(async () => {
    try {
      const addedTokenValues = Object.values(pendingTokens);
      await dispatch(addImportedTokens(addedTokenValues, networkClientId));

      addedTokenValues.forEach((pendingToken) => {
        trackEvent({
          event: MetaMetricsEventName.TokenAdded,
          category: MetaMetricsEventCategory.Wallet,
          sensitiveProperties: {
            token_symbol: pendingToken.symbol,
            token_contract_address: pendingToken.address,
            token_decimal_precision: pendingToken.decimals,
            unlisted: pendingToken.unlisted,
            source_connection_method: pendingToken.isCustom
              ? MetaMetricsTokenEventSource.Custom
              : MetaMetricsTokenEventSource.List,
            token_standard: TokenStandard.ERC20,
            asset_type: AssetType.token,
          },
        });
      });
      const tokenSymbols = [];
      for (const key in pendingTokens) {
        if (Object.prototype.hasOwnProperty.call(pendingTokens, key)) {
          tokenSymbols.push(pendingTokens[key].symbol);
        }
      }

      dispatch(setNewTokensImported(tokenSymbols.join(', ')));
      dispatch(clearPendingTokens());
      dispatch(hideImportTokensModal());
      history.push(DEFAULT_ROUTE);
    } catch (err) {
      dispatch(setNewTokensImportedError('error'));
      dispatch(clearPendingTokens());
      history.push(DEFAULT_ROUTE);
    }
  }, [dispatch, history, pendingTokens, trackEvent]);

  useEffect(() => {
    const pendingTokenKeys = Object.keys(pendingTokens);

    if (pendingTokenKeys.length === 0) {
      return;
    }

    let initialSelectedTokens = {};
    let initialCustomToken = {};

    pendingTokenKeys.forEach((tokenAddress) => {
      const token = pendingTokens[tokenAddress];
      const { isCustom } = token;

      if (isCustom) {
        initialCustomToken = { ...token };
      } else {
        initialSelectedTokens = {
          ...selectedTokens,
          [tokenAddress]: { ...token },
        };
      }
    });

    setSelectedTokens(initialSelectedTokens);
    setCustomAddress(initialCustomToken.address);
    setCustomSymbol(initialCustomToken.symbol);
    setCustomDecimals(initialCustomToken.decimals);
  }, [pendingTokens]);

  const handleCustomSymbolChange = (value) => {
    const symbol = value.trim();
    const symbolLength = symbol.length;
    let symbolError = null;

    if (symbolLength <= 0 || symbolLength >= 12) {
      symbolError = t('symbolBetweenZeroTwelve');
    }

    setCustomSymbol(symbol);
    setCustomSymbolError(symbolError);
  };

  const handleCustomDecimalsChange = (value) => {
    let decimals;
    let decimalsError = null;

    if (value) {
      decimals = Number(value.trim());
      decimalsError =
        value < MIN_DECIMAL_VALUE || value > MAX_DECIMAL_VALUE
          ? t('decimalsMustZerotoTen')
          : null;
    } else {
      decimals = '';
      decimalsError = t('tokenDecimalFetchFailed');
    }

    setCustomDecimals(decimals);
    setCustomDecimalsError(decimalsError);
  };

  const attemptToAutoFillTokenParams = async (address) => {
    const {
      symbol = '',
      decimals,
      name,
    } = await infoGetter.current(address, tokenList);

    setSymbolAutoFilled(Boolean(symbol));
    setDecimalAutoFilled(Boolean(decimals));

    handleCustomSymbolChange(symbol || '');
    handleCustomDecimalsChange(decimals);
    // Set custom token name
    setCustomName(name);
  };

  const handleToggleToken = (token) => {
    const { address } = token;
    const selectedTokensCopy = { ...selectedTokens };

    if (address in selectedTokensCopy) {
      delete selectedTokensCopy[address];
    } else {
      selectedTokensCopy[address] = token;
    }

    setSelectedTokens(selectedTokensCopy);
    setTokenSelectorError(null);
  };

  const hasError = () => {
    return (
      tokenSelectorError ||
      customAddressError ||
      customSymbolError ||
      customDecimalsError ||
      nftAddressError
    );
  };

  const hasSelected = () => {
    return customAddress || Object.keys(selectedTokens).length > 0;
  };

  const handleNext = () => {
    if (hasError()) {
      return;
    }

    if (!hasSelected()) {
      setTokenSelectorError(t('mustSelectOne'));
      return;
    }

    const tokenAddressList = Object.keys(tokenList);
    const customToken = customAddress
      ? {
          address: customAddress,
          symbol: customSymbol,
          decimals: customDecimals,
          standard: tokenStandard,
          name: customName,
        }
      : null;

    dispatch(
      setPendingTokens({ customToken, selectedTokens, tokenAddressList }),
    );
    setMode('confirm');
  };

  const handleCustomAddressChange = async (value) => {
    const address = value.trim();

    setCustomAddress(address);
    setCustomAddressError(null);
    setNftAddressError(null);
    setSymbolAutoFilled(false);
    setDecimalAutoFilled(false);
    setMainnetTokenWarning(null);

    const addressIsValid = isValidHexAddress(address, {
      allowNonPrefixed: false,
    });
    const standardAddress = addHexPrefix(address).toLowerCase();

    const isMainnetToken = Object.keys(STATIC_MAINNET_TOKEN_LIST).some(
      (key) => key.toLowerCase() === address.toLowerCase(),
    );

    let standard;
    if (addressIsValid) {
      try {
        ({ standard } = await getTokenStandardAndDetails(
          standardAddress,
          selectedAddress,
          null,
        ));
      } catch (error) {
        // ignore
      }
    }

    const addressIsEmpty = address.length === 0 || address === EMPTY_ADDRESS;

    switch (true) {
      case !addressIsValid && !addressIsEmpty:
        setCustomAddressError(t('invalidAddress'));
        setCustomSymbol('');
        setCustomDecimals(0);
        setCustomSymbolError(null);
        setCustomDecimalsError(null);
        break;

      case standard === TokenStandard.ERC1155 ||
        standard === TokenStandard.ERC721:
        setNftAddressError(
          t('nftAddressError', [
            <ButtonLink
              className="import-tokens-modal__nft-address-error-link"
              onClick={() => {
                dispatch(showImportNftsModal({ tokenAddress: address }));
                onClose();
              }}
              color={TextColor.primaryDefault}
              key="nftAddressError"
            >
              {t('importNFTPage')}
            </ButtonLink>,
          ]),
        );
        break;

      case isMainnetToken && !isMainnet:
        setMainnetTokenWarning(t('mainnetToken'));
        setCustomSymbol('');
        setCustomDecimals(0);
        setCustomSymbolError(null);
        setCustomDecimalsError(null);
        break;

      case Boolean(identities[standardAddress]):
        setCustomAddressError(t('personalAddressDetected'));
        break;

      case checkExistingAddresses(address, tokens):
        setCustomAddressError(t('tokenAlreadyAdded'));
        break;

      default:
        if (!addressIsEmpty) {
          attemptToAutoFillTokenParams(address);
          if (standard) {
            setTokenStandard(standard);
          }
        }
    }
  };

  // Determines whether to show the Search/Import or Confirm action
  const isConfirming = mode === 'confirm';

  return (
    <Modal
      isOpen
      isClosedOnOutsideClick={false}
      onClose={() => {
        if (
          Object.keys(selectedTokens).length === 0 ||
          Object.keys(pendingTokens).length === 0
        ) {
          dispatch(clearPendingTokens());
          onClose();
        } else {
          dispatch(showImportTokensExitModal());
        }
      }}
      className="import-tokens-modal import-tokens-content-scrollable"
    >
      <ModalOverlay />
      <ModalContent
        className="import-tokens-modal__modal-content"
        modalDialogProps={{
          className: 'import-tokens-modal__modal-dialog-content',
        }}
      >
        <ModalHeader
          onBack={isConfirming ? () => setMode('') : null}
          paddingBottom={4}
          paddingRight={4}
          paddingLeft={4}
          onClose={() => {
            if (Object.keys(selectedTokens).length === 0) {
              dispatch(clearPendingTokens());
              onClose();
            } else {
              dispatch(showImportTokensExitModal());
            }
          }}
        >
          {t('importTokensCamelCase')}
        </ModalHeader>
        <Box>
          <Tabs t={t} tabsClassName="import-tokens-tabs">
            {showSearchTab ? (
              <Tab
                activeClassName="import-tokens-modal__active-tab"
                buttonClassName="import-tokens-modal__button-tab"
                tabKey="search"
                name={t('search')}
              >
                {isConfirming ? (
                  <ImportTokensModalConfirm />
                ) : (
                  <Box paddingTop={4}>
                    {useTokenDetection ? null : (
                      <Box paddingLeft={4} paddingRight={4}>
                        <BannerAlert
                          severity={Severity.Info}
                          marginBottom={4}
                          paddingLeft={4}
                          paddingRight={4}
                        >
                          <Text variant={TextVariant.bodyMd} fontSize="16">
                            {t('enhancedTokenDetectionAlertMessage', [
                              networkName,
                              <ButtonLink
                                key="token-detection-announcement"
                                className="import-tokens-modal__autodetect"
                                onClick={() => {
                                  history.push(
                                    `${SECURITY_ROUTE}#auto-detect-tokens`,
                                  );
                                  history.push(mostRecentOverviewPage);
                                }}
                              >
                                {t('enableFromSettings')}
                              </ButtonLink>,
                            ])}
                          </Text>
                        </BannerAlert>
                      </Box>
                    )}
                    <Box paddingLeft={4} paddingRight={4}>
                      <TokenSearch
                        searchClassName="import-tokens-modal__button-search"
                        onSearch={({ results = [] }) =>
                          setSearchResults(results)
                        }
                        error={tokenSelectorError}
                        tokenList={tokenList}
                      />
                    </Box>

                    <Box
                      marginTop={4}
                      className="import-tokens-content-scrollable"
                    >
                      <TokenList
                        currentNetwork={currentNetwork}
                        testNetworkBackgroundColor={testNetworkBackgroundColor}
                        results={searchResults}
                        selectedTokens={selectedTokens}
                        onToggleToken={(token) => handleToggleToken(token)}
                      />
                    </Box>
                  </Box>
                )}
              </Tab>
            ) : null}
            <Tab
              activeClassName="import-tokens-modal__active-tab"
              className="import-tokens-modal__tab"
              buttonClassName="import-tokens-modal__button-tab"
              tabKey="customToken"
              name={t('customToken')}
            >
              {isConfirming ? (
                <ImportTokensModalConfirm />
              ) : (
                <Box
                  paddingTop={4}
                  paddingBottom={4}
                  className="import-tokens-modal__custom-token-form"
                >
                  {tokenDetectionInactiveOnNonMainnetSupportedNetwork ? (
                    <Box paddingLeft={4} paddingRight={4}>
                      <BannerAlert severity={Severity.Warning}>
                        {t(
                          'customTokenWarningInTokenDetectionNetworkWithTDOFF',
                          [
                            <ButtonLink
                              key="import-token-security-risk"
                              rel="noopener noreferrer"
                              target="_blank"
                              href={ZENDESK_URLS.TOKEN_SAFETY_PRACTICES}
                            >
                              {t('tokenScamSecurityRisk')}
                            </ButtonLink>,
                            <ButtonLink
                              type="link"
                              key="import-token-token-detection-announcement"
                              onClick={() => {
                                history.push(
                                  `${SECURITY_ROUTE}#auto-detect-tokens`,
                                );
                                history.push(mostRecentOverviewPage);
                              }}
                            >
                              {t('inYourSettings')}
                            </ButtonLink>,
                          ],
                        )}
                      </BannerAlert>
                    </Box>
                  ) : (
                    <Box paddingLeft={4} paddingRight={4}>
                      <BannerAlert
                        severity={
                          isDynamicTokenListAvailable
                            ? Severity.Warning
                            : Severity.Info
                        }
                      >
                        {t(
                          isDynamicTokenListAvailable
                            ? 'customTokenWarningInTokenDetectionNetwork'
                            : 'customTokenWarningInNonTokenDetectionNetwork',
                          [
                            <ButtonLink
                              key="import-token-fake-token-warning"
                              rel="noopener noreferrer"
                              target="_blank"
                              href={ZENDESK_URLS.TOKEN_SAFETY_PRACTICES}
                            >
                              {t('learnScamRisk')}
                            </ButtonLink>,
                          ],
                        )}
                      </BannerAlert>
                    </Box>
                  )}
                  <Box className="import-tokens-modal__custom-token-form__container">
                    <FormTextField
                      paddingLeft={4}
                      paddingRight={4}
                      paddingTop={6}
                      label={t('tokenContractAddress')}
                      value={customAddress}
                      onChange={(e) =>
                        handleCustomAddressChange(e.target.value)
                      }
                      helpText={
                        customAddressError ||
                        mainnetTokenWarning ||
                        nftAddressError
                      }
                      error={
                        customAddressError ||
                        mainnetTokenWarning ||
                        nftAddressError
                      }
                      autoFocus
                      textFieldProps={{
                        className:
                          'import-tokens-modal__custom-token-form__text-outline',
                      }}
                      inputProps={{
                        'data-testid': 'import-tokens-modal-custom-address',
                      }}
                    />
                    <FormTextField
                      paddingLeft={4}
                      paddingRight={4}
                      paddingTop={4}
                      label={
                        <>
                          {t('tokenSymbol')}
                          {symbolAutoFilled && !forceEditSymbol && (
                            <ButtonLink
                              onClick={() => setForceEditSymbol(true)}
                              textAlign={TextAlign.End}
                              paddingInlineEnd={1}
                              paddingInlineStart={1}
                              color={TextColor.primaryDefault}
                            >
                              {t('edit')}
                            </ButtonLink>
                          )}
                        </>
                      }
                      value={customSymbol}
                      onChange={(e) => handleCustomSymbolChange(e.target.value)}
                      helpText={customSymbolError}
                      error={customSymbolError}
                      disabled={symbolAutoFilled && !forceEditSymbol}
                      textFieldProps={{
                        className:
                          'import-tokens-modal__custom-token-form__text-outline',
                      }}
                      inputProps={{
                        'data-testid': 'import-tokens-modal-custom-symbol',
                      }}
                    />
                    <FormTextField
                      paddingLeft={4}
                      paddingRight={4}
                      paddingTop={4}
                      label={t('decimal')}
                      type="number"
                      value={customDecimals}
                      onChange={(e) =>
                        handleCustomDecimalsChange(e.target.value)
                      }
                      helpText={customDecimalsError}
                      error={customDecimalsError}
                      disabled={decimalAutoFilled}
                      min={MIN_DECIMAL_VALUE}
                      max={MAX_DECIMAL_VALUE}
                      textFieldProps={{
                        className:
                          'import-tokens-modal__custom-token-form__text-outline',
                      }}
                      inputProps={{
                        'data-testid': 'import-tokens-modal-custom-decimals',
                      }}
                    />
                  </Box>

                  {customDecimals === '' && (
                    <BannerAlert severity={Severity.Warning}>
                      <Text fontWeight={FontWeight.Bold}>
                        {t('tokenDecimalFetchFailed')}
                      </Text>
                      {t('verifyThisTokenDecimalOn', [
                        <ButtonLink
                          key="import-token-verify-token-decimal"
                          rel="noopener noreferrer"
                          target="_blank"
                          href={blockExplorerTokenLink}
                        >
                          {blockExplorerLabel}
                        </ButtonLink>,
                      ])}
                    </BannerAlert>
                  )}
                </Box>
              )}
            </Tab>
          </Tabs>
        </Box>
        {isConfirming ? (
          <Box
            paddingTop={5}
            paddingLeft={4}
            paddingRight={4}
            display={Display.Flex}
          >
            <ButtonSecondary
              size={Size.LG}
              onClick={() => {
                dispatch(clearPendingTokens());
                setMode('');
              }}
              block
              marginRight={5}
            >
              {t('back')}
            </ButtonSecondary>
            <ButtonPrimary
              size={Size.LG}
              onClick={async () => {
                await handleAddTokens();
                history.push(DEFAULT_ROUTE);
              }}
              block
              data-testid="import-tokens-modal-import-button"
            >
              {t('import')}
            </ButtonPrimary>
          </Box>
        ) : (
          <Box paddingTop={6} paddingLeft={4} paddingRight={4}>
            <ButtonPrimary
              onClick={() => handleNext()}
              size={Size.LG}
              disabled={Boolean(hasError()) || !hasSelected()}
              block
              data-testid="import-tokens-button-next"
            >
              {t('next')}
            </ButtonPrimary>
          </Box>
        )}
      </ModalContent>
    </Modal>
  );
};

ImportTokensModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};
