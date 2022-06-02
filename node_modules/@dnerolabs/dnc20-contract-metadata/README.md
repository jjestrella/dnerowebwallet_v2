# @dnerolabs/dnc20-contract-metadata

A mapping of checksummed contract addresses to metadata, like names, and images of their logos.

All address keys follow the [EIP 55 address checksum format](https://github.com/ethereum/EIPs/issues/55).

## Usage

You can install from npm with `npm install @dnerolabs/dnc20-contract-metadata` and use it in your code like this:

```javascript
import tokensByChainId from '@dnerolabs/dnc20-contract-metadata';
import ethJSUtil from 'ethereumjs-util'
const { toChecksumAddress } = ethJSUtil

function getTokenMetadata (address) {
  const chainId = 'testnet';
  return tokensByChainId[chainId][toChecksumAddress(address)];
}

getTokenMetadata ("0x141eE1a64645C29b3D1881B2734d315f9f74A377")
```
