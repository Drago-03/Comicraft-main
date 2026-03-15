// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

/**
 * @title DynamicNFT
 * @notice ERC-721 NFT with mutable tokenURI supporting content evolution.
 *         Only the platform (owner) can update metadata. Tracks evolution count
 *         and emits events for off-chain indexing.
 */
contract DynamicNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // tokenId → number of evolutions
    mapping(uint256 => uint256) public evolutionCount;

    // tokenId → max allowed evolutions (0 = unlimited)
    mapping(uint256 => uint256) public maxEvolutions;

    // tokenId → evolution type hash (for off-chain reference)
    mapping(uint256 => bytes32) public evolutionTypeHash;

    // ── Events ───────────────────────────────────────────────────────────
    event Minted(uint256 indexed tokenId, address indexed to, string tokenURI);

    event EvolutionTriggered(
        uint256 indexed tokenId,
        string newURI,
        uint256 evolutionNumber,
        string reason
    );

    event EvolutionConfigSet(
        uint256 indexed tokenId,
        uint256 maxEvolutions,
        bytes32 evolutionTypeHash
    );

    // ── Constructor ──────────────────────────────────────────────────────
    constructor() ERC721('Comicraft Dynamic NFT', 'CDNFT') Ownable() {}

    // ── Mint ─────────────────────────────────────────────────────────────
    /**
     * @notice Mint a new dynamic NFT.
     * @param to       Recipient address
     * @param uri      Initial metadata URI
     * @param _maxEvolutions Maximum evolutions allowed (0 = unlimited)
     * @param _evolutionType Evolution type identifier hash
     */
    function mint(
        address to,
        string memory uri,
        uint256 _maxEvolutions,
        bytes32 _evolutionType
    ) external onlyOwner returns (uint256) {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        maxEvolutions[tokenId] = _maxEvolutions;
        evolutionTypeHash[tokenId] = _evolutionType;

        emit Minted(tokenId, to, uri);
        emit EvolutionConfigSet(tokenId, _maxEvolutions, _evolutionType);

        return tokenId;
    }

    // ── Evolve ───────────────────────────────────────────────────────────
    /**
     * @notice Update the metadata URI of an existing NFT (evolution).
     *         Only callable by the platform (contract owner).
     * @param tokenId  Token to evolve
     * @param newURI   New metadata URI
     * @param reason   Human-readable reason for evolution
     */
    function evolve(
        uint256 tokenId,
        string memory newURI,
        string memory reason
    ) external onlyOwner {
        require(_exists(tokenId), 'Token does not exist');

        uint256 maxEvo = maxEvolutions[tokenId];
        if (maxEvo > 0) {
            require(evolutionCount[tokenId] < maxEvo, 'Max evolutions reached');
        }

        evolutionCount[tokenId]++;
        _setTokenURI(tokenId, newURI);

        emit EvolutionTriggered(tokenId, newURI, evolutionCount[tokenId], reason);
    }

    // ── Views ────────────────────────────────────────────────────────────
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    function getEvolutionInfo(uint256 tokenId) external view returns (
        uint256 count,
        uint256 maxEvo,
        bytes32 typeHash,
        string memory currentURI
    ) {
        require(_exists(tokenId), 'Token does not exist');
        return (
            evolutionCount[tokenId],
            maxEvolutions[tokenId],
            evolutionTypeHash[tokenId],
            tokenURI(tokenId)
        );
    }
}
