/*

This script returns the Merkle root value that is required for the validation of whitelisted users on the smart contract.
The initial merkle root value returned from MerkleTreeJS does not start with '0x',
and this script automatically adds '0x' at the initial value, and it prevents from getting an error from the smart contract.

How to run the script:

Add addresses into "whitelistAddresses" array, wrap each addresses with ""
Simply run 'node getMerkleTree' in Terminal
and copy and paste the value coming after 'The Merkle Root is:'.

*/
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

// add addresses of all whitelisted users
let whitelistAddresses = [
    "0x25B38CeC2F0f828F85ca76675C8Ec37db83Fd404",
    "0x221d3F5154d0400b561D39E7fb3a217cBb52AbC1",
    "0x5F0512994B53B53b3d75ae327D4Bfdf97Ee43769",
];

const leafNodes = whitelistAddresses.map(addr => keccak256(addr));
const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true});

const rootHash = merkleTree.getRoot();

console.log('Whitelist Merkle Tree\n', merkleTree.toString());
console.log('The Merkle Root is: \n',`0x${rootHash.toString('hex')}`)
