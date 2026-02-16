// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

/**
 * @custom:agent-version 1.0
 * @custom:agent-description Proxy contract for user operations; only owner or designated user can execute.
 * @custom:agent-invariant owner and user are set at construction and immutable.
 * @custom:agent-invariant Only owner or user can call protected functions unless documented otherwise.
 * @custom:agent-event Executed Emitted when an external call is executed; includes target and success.
 * @custom:agent-event TokensWithdrawn Emitted when ERC20/ERC721/ERC1155 tokens are withdrawn.
 * @custom:agent-event ETHWithdrawn Emitted when ETH is withdrawn.
 * @custom:agent-event TokenApproved Emitted when ERC20 approval is granted for a target.
 */
contract UserProxy {
    address public immutable owner;
    address public immutable user;

    // Packed events for gas efficiency
    event Executed(address indexed target, bool success);
    event TokensWithdrawn(
        address indexed token,
        address indexed to,
        uint256 amount
    );
    event ETHWithdrawn(address indexed to, uint256 amount);
    event TokenApproved(address indexed token, address indexed spender, uint256 amount);

    error Unauthorized();
    error ZeroAddress();
    error SelfCall();
    error InsufficientBalance();
    error TransferFailed();
    error ExecutionFailed();

    constructor(address _owner, address _user) {
        if (_owner == address(0)) revert ZeroAddress();
        if (_user == address(0)) revert ZeroAddress();
        owner = _owner;
        user = _user;
    }

    /**
     * @dev Execute a call to an external contract
     * @param target The target contract address
     * @param data The call data
     * @param token The token address (address(0) for ETH transactions)
     * @param amount The amount of tokens to check allowance for
     * @custom:agent-intent Execute an arbitrary call to a target contract; may approve ERC20 if needed.
     * @custom:agent-precondition Caller is owner or user.
     * @custom:agent-precondition target is not zero and not this contract.
     * @custom:agent-effect If token and amount set, may approve target to spend tokens.
     * @custom:agent-effect Emits Executed; on failure reverts with target's reason or ExecutionFailed.
     * @custom:agent-risk External call can perform any action; validate target and data off-chain.
     * @custom:agent-guidance Simulate the call first; ensure target is trusted.
     */
    function exec(address target, bytes calldata data, address token, uint256 amount) external {
        // Only owner or user can execute
        if (msg.sender != owner && msg.sender != user) revert Unauthorized();
        if (target == address(0)) revert ZeroAddress();
        if (target == address(this)) revert SelfCall();

        // Check token allowance if token is specified and amount > 0
        if (token != address(0) && amount > 0) {
            uint256 currentAllowance = IERC20(token).allowance(address(this), target);
            if (currentAllowance < amount) {
                // Approve the target to spend the required amount
                IERC20(token).approve(target, amount);
                emit TokenApproved(token, target, amount);
            }
        }

        // Execute the call
        (bool success, bytes memory returnData) = target.call(data);

        emit Executed(target, success);

        if (!success) {
            // Use assembly for efficient error propagation
            if (returnData.length > 0) {
                assembly {
                    let returnDataSize := mload(returnData)
                    revert(add(32, returnData), returnDataSize)
                }
            } else {
                revert ExecutionFailed();
            }
        }
    }

    /**
     * @dev Withdraw a specific amount of ERC20 tokens
     * @custom:agent-intent Withdraw a specific amount of ERC20 tokens to an address.
     * @custom:agent-precondition Caller is owner or user.
     * @custom:agent-precondition token and to are non-zero; amount > 0 and balance sufficient.
     * @custom:agent-effect Balance of this contract decreases; to receives tokens. Emits TokensWithdrawn.
     * @custom:agent-risk Irreversible transfer.
     */
    function withdrawERC20(address token, address to, uint256 amount) external {
        if (msg.sender != owner && msg.sender != user) revert Unauthorized();
        if (token == address(0) || to == address(0)) revert ZeroAddress();
        if (amount == 0) revert InsufficientBalance();

        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance < amount) revert InsufficientBalance();

        IERC20(token).transfer(to, amount);
        emit TokensWithdrawn(token, to, amount);
    }

    /**
     * @dev Withdraw all ERC20 tokens
     */
    function withdrawAllERC20(address token, address to) external {
        if (msg.sender != owner && msg.sender != user) revert Unauthorized();
        if (token == address(0) || to == address(0)) revert ZeroAddress();

        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance == 0) revert InsufficientBalance();

        IERC20(token).transfer(to, balance);
        emit TokensWithdrawn(token, to, balance);
    }

    /**
     * @dev Withdraw ERC721 NFT
     */
    function withdrawERC721(
        address token,
        address to,
        uint256 tokenId
    ) external {
        if (msg.sender != owner && msg.sender != user) revert Unauthorized();
        if (token == address(0) || to == address(0)) revert ZeroAddress();

        IERC721(token).safeTransferFrom(address(this), to, tokenId);
        emit TokensWithdrawn(token, to, tokenId);
    }

    /**
     * @dev Withdraw ERC1155 tokens
     */
    function withdrawERC1155(
        address token,
        address to,
        uint256 id,
        uint256 amount
    ) external {
        if (msg.sender != owner && msg.sender != user) revert Unauthorized();
        if (token == address(0) || to == address(0)) revert ZeroAddress();

        IERC1155(token).safeTransferFrom(address(this), to, id, amount, "");
        emit TokensWithdrawn(token, to, amount);
    }

    /**
     * @dev Withdraw all ETH
     */
    function withdrawAllETH(address to) external {
        if (msg.sender != owner) revert Unauthorized();
        if (to == address(0)) revert ZeroAddress();

        uint256 balance = address(this).balance;
        if (balance == 0) revert InsufficientBalance();

        (bool success, ) = to.call{value: balance}("");
        if (!success) revert TransferFailed();
        emit ETHWithdrawn(to, balance);
    }

    /**
     * @dev Emergency withdraw
     */
    function emergencyWithdraw(address token, address to) external {
        if (msg.sender != owner) revert Unauthorized();
        if (to == address(0)) revert ZeroAddress();

        if (token == address(0)) {
            uint256 balance = address(this).balance;
            if (balance > 0) {
                (bool success, ) = to.call{value: balance}("");
                if (!success) revert TransferFailed();
                emit ETHWithdrawn(to, balance);
            }
        } else {
            try IERC20(token).balanceOf(address(this)) returns (
                uint256 balance
            ) {
                if (balance > 0) {
                    IERC20(token).transfer(to, balance);
                    emit TokensWithdrawn(token, to, balance);
                }
            } catch {
                revert TransferFailed();
            }
        }
    }

    /**
     * @dev Get ETH balance
     */
    function getETHBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Get token balance
     */
    function getTokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    // Allow contract to receive ETH
    receive() external payable {}
}
