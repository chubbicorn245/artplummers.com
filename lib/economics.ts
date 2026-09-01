/**
 * Mint economics, mirrored from ArtPlumber.sol. These are `constant`s in the
 * contract and permanent once deployed — if they change there, change them
 * here too. Nothing on the site should hardcode these numbers inline.
 */

/** Size of the whole collection (contract: MAX_SUPPLY). */
export const MAX_SUPPLY = 2000;

/**
 * Most tokens one transaction may mint (contract: MAX_PER_TX). There is NO
 * per-wallet cap — this is a gas guard, since minting is a loop. A wallet
 * wanting more just sends another transaction.
 */
export const MAX_PER_TX = 20;

/**
 * Tokens an OG wallet mints for free (contract: FREE_ALLOWANCE). This is the
 * only per-wallet limit in the contract.
 */
export const FREE_ALLOWANCE = 2;

/** Price per *paid* token, in ETH (contract: MINT_PRICE). */
export const MINT_PRICE_ETH = "0.002";
