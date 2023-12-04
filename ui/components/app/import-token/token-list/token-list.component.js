import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { checkExistingAddresses } from '../../../../helpers/utils/util';
import {
  Box,
  Text,
  AvatarToken,
  BadgeWrapper,
  AvatarNetwork,
  AvatarNetworkSize,
  Checkbox,
} from '../../../component-library';
import {
  AlignItems,
  Display,
  TextColor,
  TextVariant,
  FontWeight,
} from '../../../../helpers/constants/design-system';
import TokenListPlaceholder from './token-list-placeholder';

export default class TokenList extends Component {
  static contextTypes = {
    t: PropTypes.func,
  };

  static propTypes = {
    tokens: PropTypes.array,
    results: PropTypes.array,
    selectedTokens: PropTypes.object,
    onToggleToken: PropTypes.func,
    currentNetwork: PropTypes.object,
    testNetworkBackgroundColor: PropTypes.object,
  };

  render() {
    const {
      results = [],
      selectedTokens = {},

      onToggleToken,
      tokens = [],
      currentNetwork,
      testNetworkBackgroundColor,
    } = this.props;

    return results.length === 0 ? (
      <TokenListPlaceholder />
    ) : (
      <Box className="token-list">
        <Box className="token-list__tokens-container">
          {Array(12)
            .fill(undefined)
            .map((_, i) => {
              const { symbol, name, address } = results[i] || {};
              const tokenAlreadyAdded = checkExistingAddresses(address, tokens);
              let tokenAlreadySelected;
              if (tokenAlreadyAdded) {
                tokenAlreadySelected = results[i];
              }
              const onClick = () =>
                !tokenAlreadyAdded && onToggleToken(results[i]);
              return (
                Boolean(results[i]?.iconUrl || symbol || name) && (
                  <Box
                    key={address}
                    display={Display.Flex}
                    className={classnames('token-list__token_component', {
                      'token-list__token_component--selected':
                        selectedTokens[address],
                      'token-list__token_component--disabled':
                        tokenAlreadyAdded,
                    })}
                    onClick={onClick}
                  >
                    <Box display={Display.Flex} alignItems={AlignItems.center}>
                      <Checkbox
                        isChecked={
                          selectedTokens[address] ||
                          tokenAlreadySelected ||
                          false
                        }
                        marginRight={3}
                        onClick={onClick}
                      />

                      <Box>
                        <BadgeWrapper
                          badge={
                            <AvatarNetwork
                              size={AvatarNetworkSize.Xs}
                              name={currentNetwork?.nickname}
                              src={currentNetwork?.rpcPrefs?.imageUrl}
                              backgroundColor={testNetworkBackgroundColor}
                            />
                          }
                          marginRight={3}
                          marginTop={1}
                        >
                          <AvatarToken
                            name={symbol}
                            src={results[i]?.iconUrl}
                            showHalo
                          />
                        </BadgeWrapper>
                      </Box>
                      <Box
                        marginInlineStart={2}
                        className="import-tokens-modal__confirm-token-list-item-wrapper__text"
                      >
                        <Text
                          fontWeight={FontWeight.Medium}
                          variant={TextVariant.bodyMd}
                        >
                          {name}
                        </Text>
                        <Text
                          variant={TextVariant.bodySm}
                          color={TextColor.textAlternative}
                        >
                          {symbol}
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                )
              );
            })}
        </Box>
      </Box>
    );
  }
}
