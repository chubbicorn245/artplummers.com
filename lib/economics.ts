/**
 * Mint economics, mirrored from ArtPlumber.sol. These are `constant`s in the
 * contract and permanent once deployed — if they change there, change them
 * here too. Nothing on the site should hardcode these numbers inline.
 */

/** Size of the whole collection (contract: MAX_SUPPLY). */
export const MAX_SUPPLY = 2000;

/** Tokens any one wallet may ever mint (contract: WALLET_LIMIT). */
export const WALLET_LIMIT = 10;

/**
 * Tokens an OG wallet mints for free (contract: FREE_ALLOWANCE). Carved out
 * of WALLET_LIMIT, not added to it: an OG gets 2 free + 8 paid, not 12.
 */
export const FREE_ALLOWANCE = 2;

/** Price per *paid* token, in ETH (contract: MINT_PRICE). */
export const MINT_PRICE_ETH = "0.002";

/** How many an OG wallet still pays for after using its free allowance. */
export const PAID_AFTER_FREE = WALLET_LIMIT - FREE_ALLOWANCE;
