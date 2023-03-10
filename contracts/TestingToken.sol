pragma solidity ^0.5.0;

import "./token/ERC721/ERC721Full.sol";
import "./token/ERC721/ERC721MetadataMintable.sol";
import "./token/ERC721/ERC721Mintable.sol";
import "./token/ERC721/ERC721Burnable.sol";
import "./token/ERC721/ERC721Pausable.sol";

contract TestingToken is ERC721Full, ERC721Mintable, ERC721MetadataMintable, ERC721Burnable, ERC721Pausable {
    constructor (string memory name, string memory symbol) public ERC721Full(name, symbol) {
    }
}