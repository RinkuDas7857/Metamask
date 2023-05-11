import { TypedTransaction } from '@ethereumjs/tx';
import {
  arrToBufArr,
  bufferToHex,
  ecsign,
  isValidPrivate,
  privateToPublic,
  publicToAddress,
  stripHexPrefix,
  toBuffer,
} from '@ethereumjs/util';
import {
  concatSig,
  decrypt,
  getEncryptionPublicKey,
  normalize,
  personalSign,
  signTypedData,
  SignTypedDataVersion,
} from '@metamask/eth-sig-util';
import { add0x, Eip1024EncryptedData, Hex, Keyring } from '@metamask/utils';
import { keccak256 } from 'ethereum-cryptography/keccak';
// @ts-ignore
import randombytes from 'randombytes';
import { ethers } from 'ethers';
import factoryAbi from './ddMimoWalletFactory.json';
import entryPointAbi from './EntryPoint.json';
import accountAbstractionAbi from './AccountAbstraction.json';
import {
  UserOperation,
  fillAndSign,
  fillUserOpDefaults,
  getUserOpHash,
} from './smart-contract-keyring-helper';
import { hexConcat, hexZeroPad, hexlify, parseEther } from 'ethers/lib/utils';

type KeyringOpt = {
  withAppKeyOrigin?: string;
  version?: SignTypedDataVersion | string;
};

const TYPE = 'Account Abstraction';

export default class SmartContractKeyring implements Keyring<string[]> {
  #wallets: { privateKey: Buffer; publicKey: string }[];

  readonly type: string = TYPE;

  static type: string = TYPE;

  constructor(privateKeys: string[] = []) {
    this.#wallets = [];
    console.log('constructor', privateKeys);

    /* istanbul ignore next: It's not possible to write a unit test for this, because a constructor isn't allowed
     * to be async. Jest can't await the constructor, and when the error gets thrown, Jest can't catch it. */
    this.deserialize(privateKeys).catch((error: Error) => {
      throw new Error(`Problem deserializing SimpleKeyring ${error.message}`);
    });
  }

  async serialize() {
    return this.#wallets.map(
      (a) => `${a.privateKey.toString('hex')}:${a.publicKey}`,
    );
  }

  async deserialize(privateKeys: string[]) {
    console.log('in deserialize method');
    console.log(privateKeys);
    console.log('env vars', process.env);
    this.#wallets = privateKeys.map((account) => {
      const [privateKey, scAddress] = account.split(':');
      console.log(privateKey, scAddress);
      return {
        privateKey: Buffer.from(privateKey, 'hex'),
        publicKey: scAddress,
      };
    });
    console.log(this.#wallets);
  }

  async addAccounts(numAccounts = 1) {
    const newWallets = [];
    for (let i = 0; i < numAccounts; i++) {
      const privateKey = generateKey();
      const publicKey = privateToPublic(privateKey);
      // const provider = new ethers.providers.JsonRpcProvider(
      //   'https://polygon-mumbai.infura.io/v3/{apiKey}',
      // );

      // const signer = new ethers.Wallet(privateKey, provider);
      // const factory = new ethers.Contract(
      //   '0x665cf455371e12EA5D49a7bA295cD060f436D95e',
      //   factoryAbi.abi,
      //   signer,
      // );

      // const salt = new Date().getTime();
      // const aaAddress = await factory.getAddress(
      //   publicKey.toString('hex'),
      //   salt,
      // );
      // const aaAccount = await factory.createAccount(
      //   publicKey.toString('hex'),
      //   salt,
      //   [],
      // );
      console.log("in add account method, shouldn't be here");

      newWallets.push({
        privateKey,
        publicKeyEOA: publicKey,
        publicKey: '0xmimo', // Buffer.from(aaAddress, 'hex'),
      });
    }

    this.#wallets = this.#wallets.concat(newWallets);
    const hexWallets = newWallets.map(({ publicKey }) => add0x(publicKey));
    return hexWallets;
  }

  async getAccounts() {
    console.log('in get accounts method');
    console.log(this.#wallets);
    const addresses = this.#wallets.map(({ publicKey }) => {
      console.log(add0x(publicKey));
      return add0x(publicKey);
    });
    return addresses;
  }

  async signTransaction(
    address: Hex,
    transaction: TypedTransaction,
    opts: KeyringOpt = {},
  ): Promise<UserOperation> {
    console.log('in sign transaction method');
    const privKey = this.#getPrivateKeyFor(address, opts);
    const aaAddress = this.#wallets.find(
      (wallet) => wallet.privateKey.toString('hex') === privKey.toString('hex'),
    )?.publicKey;

    console.log('aaddress', aaAddress);

    const provider = new ethers.providers.JsonRpcProvider(
      `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    );

    const chainId = await provider.getNetwork().then((net) => net.chainId);
    console.log('chainId', chainId);

    const signer = new ethers.Wallet(privKey, provider);
    const entryPoint = new ethers.Contract(
      process.env.ENTRYPOINT_ADDRESS!,
      entryPointAbi.abi,
      provider,
    );
    const accountAbstractionInstance = new ethers.Contract(
      aaAddress!,
      accountAbstractionAbi.abi,
      signer,
    );

    // console.log('nonce', await accountAbstractionInstance.getNonce());

    console.log('nonce', await accountAbstractionInstance.nonce());

    console.log('before fillAndSign');
    console.log(transaction);
    const userOp = await fillAndSign(
      fillUserOpDefaults({
        sender: address,
        callData: accountAbstractionInstance.interface.encodeFunctionData(
          'execute',
          [
            transaction.to ?? ethers.constants.AddressZero,
            transaction.value,
            transaction.data,
          ],
        ),
        paymasterAndData: opts.usePaymaster
          ? hexConcat([
              process.env.PAYMASTER_ADDRESS!,
              hexZeroPad(process.env.ACTION_TOKEN_ADDRESS!, 32),
              hexZeroPad(hexlify(1), 32),
            ])
          : '0x',
        nonce: (await accountAbstractionInstance.nonce()).toHexString(),
        callGasLimit: hexlify(2000000),
        verificationGasLimit: hexlify(1000000),
        maxFeePerGas: hexlify(3e9),
      }),
      signer,
      entryPoint,
    );

    const userOpHash = getUserOpHash(
      userOp,
      process.env.ENTRYPOINT_ADDRESS,
      chainId,
    );

    console.log('finished signing transaction');
    console.log(userOp, userOpHash);

    return { ...transaction, userOp, userOpHash };

    // const signedTx = transaction.sign(privKey);
    // Newer versions of Ethereumjs-tx are immutable and return a new tx object
    // return signedTx === undefined ? transaction : signedTx;
  }

  // For eth_sign, we need to sign arbitrary data:
  async signMessage(
    address: Hex,
    data: string,
    opts = { withAppKeyOrigin: '' },
  ) {
    const message = stripHexPrefix(data);
    const privKey = this.#getPrivateKeyFor(address, opts);
    const msgSig = ecsign(Buffer.from(message, 'hex'), privKey);
    const rawMsgSig = concatSig(toBuffer(msgSig.v), msgSig.r, msgSig.s);
    return rawMsgSig;
  }

  // For personal_sign, we need to prefix the message:
  async signPersonalMessage(
    address: Hex,
    msgHex: Hex,
    opts = { withAppKeyOrigin: '' },
  ) {
    const privKey = this.#getPrivateKeyFor(address, opts);
    return personalSign({ privateKey: privKey, data: msgHex });
  }

  // For eth_decryptMessage:
  async decryptMessage(withAccount: Hex, encryptedData: Eip1024EncryptedData) {
    const wallet = this.#getWalletForAccount(withAccount);
    const privateKey = wallet.privateKey.toString('hex');
    return decrypt({ privateKey, encryptedData });
  }

  // personal_signTypedData, signs data along with the schema
  async signTypedData(
    address: Hex,
    typedData: any,
    opts: KeyringOpt = { version: SignTypedDataVersion.V1 },
  ) {
    // Treat invalid versions as "V1"
    let version = SignTypedDataVersion.V1;

    if (opts.version && isSignTypedDataVersion(opts.version)) {
      version = SignTypedDataVersion[opts.version];
    }

    const privateKey = this.#getPrivateKeyFor(address, opts);
    return signTypedData({ privateKey, data: typedData, version });
  }

  // get public key for nacl
  async getEncryptionPublicKey(withAccount: Hex, opts?: KeyringOpt) {
    const privKey = this.#getPrivateKeyFor(withAccount, opts);
    const publicKey = getEncryptionPublicKey(privKey.toString('hex'));
    return publicKey;
  }

  #getPrivateKeyFor(address: Hex, opts: KeyringOpt = { withAppKeyOrigin: '' }) {
    if (!address) {
      throw new Error('Must specify address.');
    }
    const wallet = this.#getWalletForAccount(address, opts);
    return wallet.privateKey;
  }

  // returns an address specific to an app
  async getAppKeyAddress(address: Hex, origin: string) {
    if (!origin || typeof origin !== 'string') {
      throw new Error(`'origin' must be a non-empty string`);
    }
    const wallet = this.#getWalletForAccount(address, {
      withAppKeyOrigin: origin,
    });
    const appKeyAddress = add0x(bufferToHex(publicToAddress(wallet.publicKey)));
    return appKeyAddress;
  }

  // exportAccount should return a hex-encoded private key:
  async exportAccount(address: Hex, opts = { withAppKeyOrigin: '' }) {
    const wallet = this.#getWalletForAccount(address, opts);
    return wallet.privateKey.toString('hex');
  }

  removeAccount(address: string) {
    if (
      !this.#wallets
        .map(({ publicKey }) =>
          bufferToHex(publicToAddress(publicKey)).toLowerCase(),
        )
        .includes(address.toLowerCase())
    ) {
      throw new Error(`Address ${address} not found in this keyring`);
    }

    this.#wallets = this.#wallets.filter(
      ({ publicKey }) =>
        bufferToHex(publicKey).toLowerCase() !== address.toLowerCase(),
    );
  }

  #getWalletForAccount(account: string | number, opts: KeyringOpt = {}) {
    const address = normalize(account);
    let wallet = this.#wallets.find(
      ({ publicKey }) => bufferToHex(publicKey) === address,
    );
    if (!wallet) {
      throw new Error('Simple Keyring - Unable to find matching address.');
    }

    if (opts.withAppKeyOrigin) {
      const { privateKey } = wallet;
      const appKeyOriginBuffer = Buffer.from(opts.withAppKeyOrigin, 'utf8');
      const appKeyBuffer = Buffer.concat([privateKey, appKeyOriginBuffer]);
      const appKeyPrivateKey = arrToBufArr(keccak256(appKeyBuffer));
      const appKeyPublicKey = privateToPublic(appKeyPrivateKey);
      wallet = { privateKey: appKeyPrivateKey, publicKey: appKeyPublicKey };
    }

    return wallet;
  }
}

/**
 * Generate and validate a new random key of 32 bytes.
 *
 * @returns Buffer The generated key.
 */
function generateKey(): Buffer {
  const privateKey = randombytes(32);

  if (!isValidPrivate(privateKey)) {
    throw new Error(
      'Private key does not satisfy the curve requirements (ie. it is invalid)',
    );
  }
  return privateKey;
}

/**
 * Type predicate type guard to check if a string is in the enum SignTypedDataVersion.
 *
 * @param version - The string to check.
 * @returns Whether it's in the enum.
 */
// TODO: Put this in @metamask/eth-sig-util
function isSignTypedDataVersion(
  version: SignTypedDataVersion | string,
): version is SignTypedDataVersion {
  return version in SignTypedDataVersion;
}