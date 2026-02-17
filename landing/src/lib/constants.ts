export const DEFAULT_SOLIDITY = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @custom:agent-version 1.0
 * @custom:agent-description Simple vault: deposit and withdraw ERC20.
 * @custom:agent-invariant Total deposits always match contract balance.
 */
contract SimpleVault {
    /**
     * @custom:agent-intent Deposit ERC20 tokens into the vault; increases caller's share.
     * @custom:agent-precondition Caller has approved this contract for amount.
     * @custom:agent-precondition amount > 0.
     * @custom:agent-effect Balance of token in vault increases; user share updated.
     * @custom:agent-risk Approve only trusted contracts; check token is non-reentrant.
     * @custom:agent-guidance Simulate transferFrom before calling.
     */
    function deposit(address token, uint256 amount) external { }

    /**
     * @custom:agent-intent Withdraw tokens from vault to caller; decreases share.
     * @custom:agent-precondition Caller has sufficient balance in vault.
     * @custom:agent-effect Irreversible: tokens sent to caller.
     * @custom:agent-risk Slippage if token has transfer fees.
     */
    function withdraw(address token, uint256 amount) external { }
}`
