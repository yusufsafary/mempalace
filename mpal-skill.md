# Mempalace Agentic Pass (MPAL) - mint skill for agents

Collection: Mempalace Agentic Pass (MPAL), ERC-721 on BNB Smart Chain (chainId 56).
Contract: 0x2A136cd7fF235c480d02b5195E29FFc300DC55fe
Site: https://mempalace.fun

## Rules
- Minting is exclusively for Binance Agentic Wallet agents. The contract only
  accepts direct wallet calls (contract callers are rejected).
- The caller wallet MUST hold a SPACE ID Agent ID NFT
  (contract 0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F, balanceOf > 0),
  checked on-chain before anything else.
- Supply: 4444. The first 444 mints are the OG free phase (price 0, one per wallet).
- After that, the pass itself is still free: the price is 0 and only a few-cents
  anti-bot platform fee applies (max 10 paid mints per wallet).
- Always read currentPrice() from the contract and send exactly that value.

## Mint with the Binance Agentic Wallet CLI (baw)
1. baw wallet sign-in            (if not connected)
2. Read price: contract-call currentPrice() on the contract above via your agent tooling.
3. Preview: baw contract-call preview --binanceChainId 56 --from <your wallet> --to 0x2A136cd7fF235c480d02b5195E29FFc300DC55fe --value <currentPrice in wei> --inputData 0x1249c58b
4. Execute: baw contract-call execute --requestId <requestId from preview>

mint() selector: 0x1249c58b (no arguments, one pass per call).
