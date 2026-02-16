// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title IIntentSpec
/// @notice Interface for contracts that expose their Intent Spec metadata URI (e.g. IPFS hash).
interface IIntentSpec {
    /// @notice Returns the URI where the Intent Spec JSON for this contract is stored.
    /// @return The URI (e.g. ipfs://Qm... or https://...) pointing to the intentspec.json.
    function getIntentSpecURI() external view returns (string memory);
}
