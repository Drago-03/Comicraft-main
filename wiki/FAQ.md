<p align="center">
  <img src="https://www.comicraft.xyz/groq_tales_logo.png" alt="Comicraft Logo" width="150" />
</p>

# Frequently Asked Questions (FAQ) for Comicraft

<div align="center">
  <img src="../../public/Comicraft.png" alt="Comicraft Logo" width="300" />
</div>

This FAQ page addresses common questions about Comicraft, an AI-powered Web3 storytelling platform.
If you have additional queries or need further assistance, please reach out via
[GitHub Discussions](https://github.com/Drago-03/Comicraft/discussions) or refer to other Wiki
resources.

## Table of Contents

- [General Questions](#general-questions)
- [Story Creation](#story-creation)
- [NFT Minting](#nft-minting)
- [Account and Wallet](#account-and-wallet)
- [Development and API](#development-and-api)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

## General Questions

**Q: What is Comicraft?** A: Comicraft is a platform that combines artificial intelligence (AI) and
Web3 technologies to enable users to create, share, and monetize stories. Using AI, you can generate
unique narratives, and with blockchain technology, you can mint these stories as Non-Fungible Tokens
(NFTs) on the Monad blockchain for ownership and authenticity. Learn more in
[What is Comicraft?](../What-is-Comicraft.md).

**Q: Is Comicraft free to use?** A: Yes, many features like story generation and publishing to the
community are free. However, minting stories as NFTs requires a connected cryptocurrency wallet and
may involve small blockchain transaction fees (gas fees), especially on the Monad Mainnet when live.
Testnet operations are typically free using test tokens.

**Q: Do I need a cryptocurrency wallet to use Comicraft?** A: A wallet is required for minting NFTs
and may be necessary for publishing stories to ensure authenticity. For basic story creation and
browsing, a wallet might not be needed. Supported wallets include MetaMask, WalletConnect, and
Ledger. See [Managing Your Account](../Managing-Your-Account.md) for connection instructions.

**Q: Which blockchain does Comicraft use?** A: Comicraft operates on the Monad blockchain, currently
using the Monad Testnet for development and testing. The platform plans to transition to Monad
Mainnet for production use. This ensures scalability and compatibility with Ethereum Virtual Machine
(EVM) standards.

## Story Creation

**Q: How does AI story generation work on Comicraft?** A: Comicraft uses advanced AI models (like
those from Groq) to generate stories based on user inputs such as genre, title, overview,
characters, setting, and plot details. You provide parameters through the AI Story Generator, and
the AI crafts a narrative tailored to your specifications. Check
[Creating Stories](../Creating-Stories.md) for a detailed guide.

**Q: Can I edit or regenerate a story after it's created?** A: Yes, after generating a story, you
can review and manually edit the content in the output area. If it's not to your liking, click
"Generate Story" again to create a new version with the same or modified inputs. See
[Creating Stories](../Creating-Stories.md#editing-and-regenerating).

**Q: How can I make my stories more unique or tailored?** A: Provide detailed inputs in the story
outline section, including specific character traits, settings, plot points, and themes. Adjust the
"Creativity Level" slider under advanced options for more experimental outputs (higher values) or
structured narratives (lower values). Experiment with different genres and prompts for varied
results.

## NFT Minting

**Q: What does it mean to mint a story as an NFT?** A: Minting a story as an NFT creates a unique
digital asset on the Monad blockchain, representing ownership of your AI-generated content. This
allows you to prove authenticity, showcase your work, and potentially trade or sell it within
blockchain ecosystems. Learn more in [Minting NFTs](../Minting-NFTs.md).

**Q: How much does it cost to mint an NFT on Comicraft?** A: On the Monad Testnet, minting is free
using test tokens (obtainable from a faucet when available). On the future Mainnet, you'll pay a
small gas fee in Monad tokens, typically a fraction of a cent to a few cents, depending on network
demand. Comicraft currently does not charge additional fees beyond blockchain costs. See
[Minting NFTs](../Minting-NFTs.md#understanding-transaction-fees).

**Q: Can I sell or trade my Comicraft NFTs?** A: Currently, Comicraft focuses on minting and
displaying NFTs within the platform (e.g., in the NFT Gallery or your profile). Trading or selling
features may be integrated in the future. For now, you can list NFTs on external Monad-compatible
marketplaces if supported. Check [Minting NFTs](../Minting-NFTs.md#viewing-and-managing-your-nfts)
for updates.

## Account and Wallet

**Q: Why do I need to connect a wallet to publish or mint stories?** A: Connecting a wallet ensures
authenticity and ownership. For publishing, it verifies your identity within the community. For
minting NFTs, it's necessary to interact with the Monad blockchain, assigning ownership of the
digital asset to your wallet address. See
[Managing Your Account](../Managing-Your-Account.md#connecting-a-wallet).

**Q: What should I do if I lose access to my wallet?** A: If you lose access to your wallet (e.g.,
forget your seed phrase), you will lose access to your Comicraft profile and associated NFTs, as
accounts are tied to wallet addresses. Comicraft cannot recover lost wallet access. Always securely
back up your wallet's recovery phrase. For help with wallet recovery, contact your wallet provider
(e.g., MetaMask support).

**Q: How do I switch to the Monad network in my wallet?** A: When minting an NFT, Comicraft will
prompt you to switch to the Monad Testnet if your wallet is on a different network. Approve the
switch in your wallet (e.g., MetaMask). If manual setup is needed, add the network with Chain ID:
10143, RPC URL: `https://testnet-rpc.monad.xyz`, and Currency Symbol: MONAD. Details are in
[Managing Your Account](../Managing-Your-Account.md#switching-networks).

## Development and API

**Q: Can I build applications on top of Comicraft?** A: Yes, Comicraft is developing APIs for story
generation, NFT minting, and user management, allowing developers to create custom applications or
integrations. Smart contracts on the Monad blockchain can also be interacted with for blockchain
features. See [API Documentation](../API-Documentation.md) and
[Smart Contracts](../Smart-Contracts.md) for details.

**Q: Where can I find smart contract addresses or ABIs for Comicraft?** A: As Comicraft is under
development, specific contract addresses and ABIs for the Monad Testnet or Mainnet are not yet
finalized. Check the repository for updates in a `contracts` or `deployments` directory, or look for
announcements in [GitHub Discussions](https://github.com/Drago-03/Comicraft/discussions). Details
are in [Smart Contracts](../Smart-Contracts.md#contract-addresses).

## Troubleshooting

**Q: Why does story generation fail or take too long?** A: Story generation may fail due to internet
issues, server load, or incomplete inputs. Ensure all required fields (like genre or overview) are
filled, check your connection, and retry. If using a custom API key, verify it's valid. Generation
time varies based on complexity and server demand, typically taking a few seconds to a minute. See
[Creating Stories](../Creating-Stories.md#troubleshooting).

**Q: What should I do if NFT minting fails?** A: Minting can fail due to wallet issues, wrong
network, or insufficient funds. Ensure your wallet is connected, set to Monad Testnet (Chain ID:
10143), and has test tokens (for Testnet). Check for error messages in your wallet (e.g.,
"insufficient funds" or "transaction reverted") and retry. Details in
[Minting NFTs](../Minting-NFTs.md#troubleshooting-minting-issues).

**Q: Why can't I connect my wallet to Comicraft?** A: Wallet connection issues may arise if the
wallet extension (e.g., MetaMask) isn't installed, is locked, or lacks permissions. Install and
unlock your wallet, ensure browser compatibility (use Chrome or Firefox), disable conflicting
extensions, and approve connection requests. See
[Managing Your Account](../Managing-Your-Account.md#troubleshooting-account-issues).

## Next Steps

- Dive deeper into story creation with [Creating Stories](../Creating-Stories.md).
- Learn about minting digital collectibles in [Minting NFTs](../Minting-NFTs.md).
- Set up a development environment with [Development Setup](../Development-Setup.md).
- Return to the [Home](../Home.md) page for more resources.

If your question isn't answered here, feel free to ask in
[GitHub Discussions](https://github.com/Drago-03/Comicraft/discussions) for community or developer
support.
