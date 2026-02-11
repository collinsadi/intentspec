# intentspec CLI

Command-line tool for **Intent Spec**: extract agent-readable metadata from Solidity contracts using custom NatSpec tags and emit schema-compliant JSON.

---

## Requirements

- **Node.js** ≥ 18
- Solidity contracts that use `@custom:agent-*` NatSpec tags (see [NatSpec tags](#natspec-tags))

---

## Installation

### Option 1: Run with npx (no install)

From any directory:

```bash
npx intentspec compile
npx intentspec extract-natspec --file path/to/Contract.sol
```


### Option 2: Install globally

```bash
npm install -g intentspec
```

Then run from anywhere:

```bash
intentspec compile
intentspec extract-natspec -f contracts/MyContract.sol
```

### Option 3: Install as a dev dependency in your project

```bash
npm install --save-dev intentspec
```

Use via `npx` in scripts or locally:

```bash
npx intentspec compile
```

### Option 4: Build from source

```bash
git clone <repo-url>
cd intent-spec/cli
npm install
npm run build
```

Run the built CLI:

```bash
node dist/index.js compile
# or link globally: npm link && intentspec compile
```

---

## Commands

### `compile`

Scans a directory for all `.sol` files (recursively, excluding `node_modules` and `.git`), extracts Intent Spec metadata from each file that contains a contract with valid NatSpec, and writes one JSON file per contract into an **`intentspec/`** folder.

**Usage:**

```bash
intentspec compile
intentspec compile --dir /path/to/contracts
intentspec compile -d ./src
```

| Option | Description | Default |
|--------|-------------|---------|
| `-d, --dir <path>` | Root directory to search for `.sol` files | Current directory (`.`)

**Behavior:**

- Creates `intentspec/` in the root directory you specify.
- For each `.sol` file that has a **contract** and at least one function with `@custom:agent-intent`, writes `intentspec/<ContractName>.json`.
- Skips files that do not declare a contract or have no valid agent NatSpec.

**Example:**

```bash
cd my-project
intentspec compile
# → Creates  intentspec/Token.json, etc.
```

---

### `extract-natspec`

Reads a **single** Solidity file, extracts Intent Spec from it, and prints the JSON to stdout (no file written).

**Usage:**

```bash
intentspec extract-natspec
intentspec extract-natspec --file contracts/MyContract.sol
intentspec extract-natspec -f ./src/Proxy.sol
```

| Option | Description | Default |
|--------|-------------|---------|
| `-f, --file <path>` | Path to the Solidity file | Built-in default path (for development) |

Paths are resolved relative to the current working directory. Use this for quick inspection or piping into other tools.

**Example:**

```bash
intentspec extract-natspec -f contracts/UserProxy.sol | jq .
```

---

## NatSpec tags

The CLI only includes in the spec what you declare with these tags. Put them in **block comments** (`/** ... */`) directly above the contract or function.

### Contract-level (block above `contract Name {`)

| Tag | Purpose | Example |
|-----|---------|--------|
| `@custom:agent-version` | Contract version | `@custom:agent-version 1.0` |
| `@custom:agent-description` | Short description | `@custom:agent-description Proxy for user ops.` |
| `@custom:agent-invariant` | Invariant (can repeat) | `@custom:agent-invariant owner is immutable.` |
| `@custom:agent-event` | Event name + description | `@custom:agent-event Transfer Token balance change.` |

### Function-level (block above each `function`)

| Tag | Purpose | Example |
|-----|---------|--------|
| `@custom:agent-intent` | **Required.** One-line intent | `@custom:agent-intent Withdraws ERC20 to an address.` |
| `@custom:agent-precondition` | Precondition (can repeat) | `@custom:agent-precondition Caller is owner or user.` |
| `@custom:agent-effect` | Effect (can repeat) | `@custom:agent-effect Balance decreases; emits Transfer.` |
| `@custom:agent-risk` | Risk (can repeat) | `@custom:agent-risk Irreversible transfer.` |
| `@custom:agent-guidance` | Guidance for agents | `@custom:agent-guidance Check balance before calling.` |

Only functions that have **`@custom:agent-intent`** are included in the generated spec. Preconditions, effects, risks, and guidance are optional and can appear multiple times (they become arrays in JSON).

---

## Output schema

Generated JSON follows the [Intent Spec schema](https://intentspec.collinsadi.xyz/v1/intentspec.schema.json). Each file under `intentspec/` looks like:

```json
{
  "contract": {
    "name": "UserProxy",
    "version": "1.0",
    "description": "Proxy for user operations."
  },
  "functions": [
    {
      "name": "withdrawERC20",
      "signature": "0x44004cc1",
      "intent": "Withdraw a specific amount of ERC20 tokens to an address.",
      "preconditions": ["Caller is owner or user.", "token and to are non-zero."],
      "effects": ["Balance decreases; to receives tokens. Emits TokensWithdrawn."],
      "risks": ["Irreversible transfer."],
      "agentGuidance": "Check balance first."
    }
  ],
  "events": [
    { "name": "TokensWithdrawn", "description": "Emitted when tokens are withdrawn." }
  ],
  "invariants": ["owner and user are set at construction and immutable."]
}
```

- **`signature`** is the EVM function selector in hex (first 4 bytes of `keccak256(functionSignature)`).
- **`contract`** and **`functions`** are required; **`events`** and **`invariants`** are optional.

---

## Example workflow

1. **Annotate** your Solidity contract with `@custom:agent-*` tags (see [NatSpec tags](#natspec-tags)).
2. **Generate** specs:
   ```bash
   npx intentspec compile
   ```
3. **Inspect** `intentspec/<ContractName>.json` and use it for agents, docs, or publishing (e.g. IPFS + on-chain pointer).

Re-run `intentspec compile` after changing NatSpec to refresh the JSON.

---

## Scripts (from source)

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript and emit to `dist/` |
| `npm run dev` | Watch and recompile on change |
| `npm run start` | Run `node dist/index.js` |
| `npm run clean` | Remove `dist/` |

---

## License

MIT. See [LICENSE](./LICENSE) in this folder.
