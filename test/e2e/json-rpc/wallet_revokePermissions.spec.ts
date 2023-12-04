import { strict as assert } from 'assert';
import { Suite } from 'mocha';
import FixtureBuilder from '../fixture-builder';
import {
  withFixtures,
  defaultGanacheOptions,
  unlockWallet,
  openDapp,
} from '../helpers';
import { Driver } from '../webdriver/driver';

describe('Revoke Dapp Permissions', function (this: Suite) {
  it('should revoke dapp permissions ', async function () {
    await withFixtures(
      {
        dapp: true,
        fixtures: new FixtureBuilder()
          .withPermissionControllerConnectedToTestDapp()
          .build(),
        defaultGanacheOptions,
        title: this.test?.fullTitle(),
      },
      async ({ driver }: { driver: Driver }) => {
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

        // TODO: Fix having to reload dapp as it is not the proper behavior in production, issue with test setup.
        // await driver.executeScript(`window.location.reload()`);
        assert.equal(true, false)
        accountsDiv = await driver.findElement('#accounts');

        assert.equal(await accountsDiv.getText(), '');
      },
    );
  });
});
