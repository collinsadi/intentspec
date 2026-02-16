# Intent Spec

**Agent-readable smart contract documentation layer** — bridging the semantic gap between on-chain logic and autonomous reasoning.

**[Demo Video](https://www.youtube.com/watch?v=6IwccYEbqZc)** · **[CLI on npm](https://www.npmjs.com/package/intentspec)**

[![npm](https://img.shields.io/npm/v/intentspec)](https://www.npmjs.com/package/intentspec)

---

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [The Intent Schema](#the-intent-schema)
- [Developer Workflow](#developer-workflow)
- [NatSpec Tags](#natspec-tags)
- [The Problem: The "Black Box" of ABIs](#the-problem-the-black-box-of-abis)
- [The Solution](#the-solution)
- [Whitepaper: The Semantic Safety Frontier](#whitepaper-the-semantic-safety-frontier)
- [Impact & Use Cases](#impact--use-cases)
- [License](#license)

---

## Overview

On-chain activity is increasingly driven by **autonomous agents**. Smart contracts, however, remain optimized for human auditors. Agents today infer behavior from function names and ABIs alone, which is brittle and error-prone.

**Intent Spec** adds a standardized, machine-verifiable metadata layer so developers can declare a function’s **intent**, **economic impact**, and **safety boundaries**. By turning opaque bytecode into structured semantics, Intent Spec reduces systemic risk and supports a safer agentic economy.

---

## Installation

**Requirements:** Node.js ≥ 18

Run without installing (recommended):

```bash
npx intentspec compile
npx intentspec extract-natspec --file path/to/Contract.sol
```

Or install globally:

```bash
npm install -g intentspec
```

Or as a dev dependency:

```bash
npm install --save-dev intentspec
```

Full CLI docs (options, build from source): **[cli/README.md](cli/README.md)**.

---

## Quick Start

1. **Annotate** your Solidity contract with `@custom:agent-*` NatSpec tags (see [NatSpec Tags](#natspec-tags)).
2. **Generate** specs from your project directory:

   ```bash
   npx intentspec compile
   ```

   This scans for `.sol` files (excluding `node_modules` and `.git`), extracts metadata, and writes one JSON file per contract to **`intentspec/<ContractName>.json`**.

3. **Inspect or publish** the generated files (e.g. use in agents, docs, or upload to IPFS and point on-chain metadata to the hash).

To extract from a **single file** and print JSON to stdout:

```bash
npx intentspec extract-natspec -f contracts/MyContract.sol
```

---

## Project Structure

```
intent-spec/
├── cli/          # intentspec CLI — parses NatSpec and generates intentspec JSON
│   ├── src/      # TypeScript source (index.ts, natspec.ts, logger.ts)
│   └── dist/     # Compiled output (published to npm)
├── schema/       # Intent Spec JSON Schema
│   └── intentspec.schema.json
├── solidity/     # Solidity interface for on-chain metadata discovery
│   └── IIntentSpec.sol   # getIntentSpecURI() — returns IPFS/URI of intentspec.json
├── README.md
└── LICENSE
```

The **CLI** is published as the [intentspec](https://www.npmjs.com/package/intentspec) npm package. The **schema** defines the structure of generated `intentspec.json` files so agents can parse them without ambiguity.

---

## The Intent Schema

Generated files conform to **`schema/intentspec.schema.json`**. All text is brief and precise for AI consumption.

**Example `intentspec.json`:**

```json
{
  "contract": {
    "name": "ExampleToken",
    "version": "1.0",
    "description": "ERC-20 with minting."
  },
  "functions": [
    {
      "name": "mint",
      "intent": "Mints tokens to an address; increases total supply.",
      "signature": "0x1234567890abcdef",
      "preconditions": [
        "Caller has MINTER_ROLE.",
        "Amount > 0 and within supply cap."
      ],
      "effects": [
        "Irreversible: supply increases.",
        "Economic: dilutes holders."
      ],
      "risks": ["Inflation if abused.", "Reentrancy without guards."],
      "agentGuidance": "Simulate first; check role revocation in recent blocks."
    }
  ],
  "events": [
    {
      "name": "Transfer",
      "description": "Token moves; index for balances."
    }
  ],
  "invariants": ["Total supply never decreases.", "Paused blocks transfers."]
}
```

- **`contract`** and **`functions`** are required; **`events`** and **`invariants`** are optional.
- **`signature`** is the EVM function selector (first 4 bytes of `keccak256(functionSignature)`) in hex.

---

## Developer Workflow

1. **Annotate** — Use custom NatSpec tags in your `.sol` files:

   ```solidity
   /// @custom:agent-intent Withdraws collateral and closes position
   /// @custom:agent-risk High slippage during volatility
   function exitPosition(uint256 amount) external { ... }
   ```

2. **Generate** — Run the CLI to extract metadata:

   ```bash
   npx intentspec compile
   ```

   Or for a single file (stdout):

   ```bash
   npx intentspec extract-natspec -f path/to/Contract.sol
   ```

3. **Publish** — Upload the generated `intentspec/*.json` to IPFS (or another URI), then have your contract expose it on-chain by implementing **`IIntentSpec`** from `solidity/IIntentSpec.sol` and returning that URI from `getIntentSpecURI()`. Agents can then discover the spec by calling this function.

---

## NatSpec Tags

Place tags in **block comments** (`/** ... */`) directly above the contract or function.

| Level   | Tag                      | Purpose                |
|---------|--------------------------|------------------------|
| Contract| `@custom:agent-version`  | Contract version       |
| Contract| `@custom:agent-description` | Short description  |
| Contract| `@custom:agent-invariant`| Invariant (repeatable) |
| Contract| `@custom:agent-event`    | Event name + description |
| Function| `@custom:agent-intent`   | **Required.** One-line intent |
| Function| `@custom:agent-precondition` | Precondition (repeatable) |
| Function| `@custom:agent-effect`   | Effect (repeatable)    |
| Function| `@custom:agent-risk`     | Risk (repeatable)      |
| Function| `@custom:agent-guidance` | Guidance for agents   |

Only functions with **`@custom:agent-intent`** are included in the generated spec. See **[cli/README.md](cli/README.md)** for detailed examples and behavior.

---

## The Problem: The "Black Box" of ABIs

Agents interact with contracts via the **Application Binary Interface (ABI)**. The ABI defines *how* to call a function but not *why* or *what the risks are*.

- **Ambiguity** — Is `execute()` a harmless state update or a high-risk treasury transfer?
- **Invisible preconditions** — Does this function depend on oracle state not visible in the parameters?
- **Irreversibility** — Agents lack a clear “danger” signal for actions that cannot be undone.

---

## The Solution

Intent Spec provides a **metadata discovery standard** and **tooling** that anchor semantic intent to the contract. Metadata can be referenced by a verifiable hash (e.g. IPFS) and, with standards like ERC-7856, discovered on-chain via `agentMetadataURI()`.

- **Discovery** — Agent queries metadata (e.g. via ERC-7856).
- **Validation** — Compare declared intent and preconditions to the agent’s goal.
- **Simulation** — Run local EVM simulation and compare state changes with metadata.

---

## Whitepaper: The Semantic Safety Frontier

### 1. The Entropy of Automation

The EVM enforces **syntactic correctness** but not **semantic intent**. As LLM-driven agents begin to manage private keys, this “semantic gap” becomes critical. Intent Spec provides a ground-truth anchor for machine reasoning.

### 2. The Formal Problem

Agents today perform a translation:

$$T(\text{ABI}, \text{Bytecode}) \rightarrow \text{Intent}_{\text{Estimated}}$$

Because the ABI is sparse, estimation variance is high, leading to **agentic drift**. Intent Spec introduces a structured **verification loop**: discover metadata, validate declared intent against the goal, and correlate simulation state changes with expected outcomes.

### 3. Impact on Safety

With structured metadata we move to **constraint-based interaction**. Let \(P(f)\) be the probability of a “failure of intent.” With a semantic anchor \(A\):

$$P(f)_{\text{ASCD}} = P(f) \cdot e^{-k \cdot A}$$

Preliminary benchmarks suggest this can reduce certain classes of catastrophic agent errors significantly.

---

## Impact & Use Cases

- **DeFi protocols** — Make contracts interpretable by agents to attract “agentic liquidity.”
- **Security auditors** — Machine-readable spec to compare against bytecode and behavior.
- **Users** — Agents (e.g. ENS-integrated) can explain transaction risks in plain language.
- **Systemic safety** — Reduce AI-driven “flash crashes” from agents misinterpreting complex logic.

---

## License

MIT © Collins Adi. See [LICENSE](LICENSE).
