// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CollectorsRepublicNFT
 * @dev ERC-721 NFT contract for tokenized trading cards.
 *      Each NFT represents a physical card held in custody.
 *      Uses UUPS proxy pattern for upgradeability.
 *
 * Roles:
 *   - ADMIN_ROLE: Can grant/revoke minter, pause, upgrade
 *   - MINTER_ROLE: Backend relayer that mints NFTs (gasless for users)
 *   - BURNER_ROLE: Can burn NFTs on redemption
 */
contract CollectorsRepublicNFT is
    ERC721,
    ERC721URIStorage,
    ERC721Burnable,
    AccessControl
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    uint256 private _nextTokenId;

    // Platform fee for marketplace sales (basis points, 250 = 2.5%)
    uint256 public platformFeeBps;
    address public feeRecipient;

    // Mapping from tokenId to physical card certificate number
    mapping(uint256 => string) private _certificateNumbers;

    // Mapping from tokenId to vault status
    mapping(uint256 => bool) private _inVault;

    // Events
    event CardMinted(uint256 indexed tokenId, address indexed to, string certificateNo);
    event CardRedeemed(uint256 indexed tokenId, address indexed owner);
    event VaultStatusChanged(uint256 indexed tokenId, bool inVault);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);

    constructor(
        address admin,
        address minter,
        uint256 _platformFeeBps,
        address _feeRecipient
    ) ERC721("Collectors Republic", "CREP") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(MINTER_ROLE, minter);
        _grantRole(BURNER_ROLE, admin);

        platformFeeBps = _platformFeeBps;
        feeRecipient = _feeRecipient;

        _nextTokenId = 1; // Start from 1, 0 is reserved
    }

    /**
     * @dev Mint a new NFT for a physical card.
     * @param to Recipient wallet address
     * @param uri IPFS metadata URI
     * @param certificateNo Physical card certificate number (PSA/CGC/BGS)
     * @return tokenId The minted token ID
     */
    function mintCard(
        address to,
        string memory uri,
        string memory certificateNo
    ) public onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        _certificateNumbers[tokenId] = certificateNo;
        _inVault[tokenId] = true;

        emit CardMinted(tokenId, to, certificateNo);
        return tokenId;
    }

    /**
     * @dev Batch mint multiple NFTs in a single transaction.
     */
    function batchMint(
        address[] memory to,
        string[] memory uris,
        string[] memory certificateNos
    ) public onlyRole(MINTER_ROLE) returns (uint256[] memory) {
        require(
            to.length == uris.length && uris.length == certificateNos.length,
            "Array length mismatch"
        );

        uint256[] memory tokenIds = new uint256[](to.length);
        for (uint256 i = 0; i < to.length; i++) {
            tokenIds[i] = mintCard(to[i], uris[i], certificateNos[i]);
        }
        return tokenIds;
    }

    /**
     * @dev Redeem: burn NFT and release physical card from vault.
     */
    function redeemCard(uint256 tokenId) public {
        require(
            ownerOf(tokenId) == msg.sender || hasRole(BURNER_ROLE, msg.sender),
            "Not authorized to redeem"
        );
        require(_inVault[tokenId], "Card not in vault");

        _inVault[tokenId] = false;
        emit CardRedeemed(tokenId, ownerOf(tokenId));
        emit VaultStatusChanged(tokenId, false);

        // Burn the NFT
        _burn(tokenId);
    }

    /**
     * @dev Update platform fee (admin only).
     */
    function setPlatformFee(uint256 newFeeBps) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newFeeBps <= 1000, "Fee too high"); // Max 10%
        uint256 oldFee = platformFeeBps;
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(oldFee, newFeeBps);
    }

    function setFeeRecipient(address newRecipient) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newRecipient != address(0), "Invalid address");
        feeRecipient = newRecipient;
    }

    // View functions
    function getCertificateNumber(uint256 tokenId) public view returns (string memory) {
        return _certificateNumbers[tokenId];
    }

    function isInVault(uint256 tokenId) public view returns (bool) {
        return _inVault[tokenId];
    }

    function totalMinted() public view returns (uint256) {
        return _nextTokenId - 1;
    }

    // Required overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
