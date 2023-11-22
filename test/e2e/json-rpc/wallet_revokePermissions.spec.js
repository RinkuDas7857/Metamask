const { strict: assert } = require('assert');
const {
  withFixtures,
  defaultGanacheOptions,
  unlockWallet,
  openDapp,
} = require('../helpers');
const FixtureBuilder = require('../fixture-builder');

describe('Revoke Dapp Permissions', function () {
  it('should revoke dapp permissions ', async function () {
    await withFixtures(
      {
        dapp: true,
        fixtures: new FixtureBuilder()
          .withPermissionControllerConnectedToTestDapp()
          .build(),
        defaultGanacheOptions,
        title: this.test.fullTitle(),
      },
      async ({ driver }) => {
        await driver.navigate();
        await unlockWallet(driver);

        await openDapp(driver);

        let accountsDiv = await driver.findElement('#accounts');

        assert.equal(
          await accountsDiv.getText(),
          '0x5cfe73b6021e818b776b421b1c4db2474086a7e1',
        );

        // wallet_revokePermissions request
        const revokePermissionsRequest = JSON.stringify({
          jsonrpc: '2.0',
          method: 'wallet_revokePermissions',
          params: [
            {
              eth_accounts: {},
            },
          ],
        });

        const result = await driver.executeScript(
          `return window.ethereum.request(${revokePermissionsRequest})`,
        );

        // Response of method call
        assert.deepEqual(result, null);

        // Reload Dapp
        await driver.executeScript(`window.location.reload()`);

        accountsDiv = await driver.findElement('#accounts');

        assert.equal(await accountsDiv.getText(), '');
      },
    );
  });
});
