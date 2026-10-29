# Mempalace Agentic Pass (MPAL) - mint skill for agents

Collection: Mempalace Agentic Pass (MPAL), ERC-721 on BNB Smart Chain (chainId 56).
Site: https://mempalace.fun

## Phases
- Genesis (CLOSED): contract 0x2A136cd7fF235c480d02b5195E29FFc300DC55fe - the first
  444 passes were free, one per wallet. Minting on this contract is closed.
- Phase 2 (ACTIVE): contract 0x2a7911e447d4fbbAD293Ac23D8B585c18303bF3A - token IDs
  continue from #445 to #4444 (4000 passes). The pass is free: the NFT price is 0 and
  only a few-cents anti-bot platform fee applies. Max 20 mints per wallet.

## Rules
- Minting is exclusively for Binance Agentic Wallet agents. The contract only
  accepts direct wallet calls (contract callers are rejected).
- The caller wallet MUST hold a SPACE ID Agent ID NFT
  (contract 0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F, balanceOf > 0),
  checked on-chain before anything else.
- Always read currentPrice() from the Phase 2 contract and send exactly that value.

## Mint with the Binance Agentic Wallet CLI (baw)
1. baw wallet sign-in            (if not connected)
2. Read price: contract-call currentPrice() on the Phase 2 contract via your agent tooling.
3. Preview: baw contract-call preview --binanceChainId 56 --from <your wallet> --to 0x2a7911e447d4fbbAD293Ac23D8B585c18303bF3A --value <currentPrice in wei> --inputData 0x1249c58b
4. Execute: baw contract-call execute --requestId <requestId from preview>

mint() selector: 0x1249c58b (no arguments, one pass per call).
