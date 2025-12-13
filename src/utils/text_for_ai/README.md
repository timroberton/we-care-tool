# AI-Readable Text Conversion Utilities

Functions to convert visualization data structures into clear, structured text optimized for AI interpretation.

## Functions

### `getReadableTextFromResults(results, options?)`

**Purpose**: Comprehensive results overview with flexible sections

**Options**:
```typescript
{
  includeSummary?: boolean;              // Executive summary (default: true)
  includeDetailedTable?: boolean;        // Full metrics table (default: false)
  includeKeyMetrics?: boolean;           // Key pathway metrics (default: true)
  includeSafetyOutcomesChart?: boolean;  // Safety outcomes chart (default: false)
  includeFlowDiagrams?: boolean;         // Flow diagrams for all scenarios (default: false)
  flowModelType?: FlowModelKey;          // Flow detail level (default: "summary")
}
```

**Example usage**:
```typescript
import { getReadableTextFromResults } from "~/utils/text_for_ai";

// Quick summary for AI context
const quickSummary = getReadableTextFromResults(results);

// Detailed analysis
const fullAnalysis = getReadableTextFromResults(results, {
  includeDetailedTable: true,
  includeSafetyOutcomesChart: true,
  includeFlowDiagrams: true,
  flowModelType: "standard"
});

// Safety-focused view
const safetyView = getReadableTextFromResults(results, {
  includeSummary: true,
  includeKeyMetrics: false,
  includeSafetyOutcomesChart: true
});
```

**Example output** (quick summary):
```
══════════════════════════════════════════════════════════════════════
  ABORTION CARE MODEL RESULTS
══════════════════════════════════════════════════════════════════════

SCENARIOS:
  - Baseline (id: baseline-uuid-123)
  - Improved Access (id: scenario-uuid-456)

AVAILABLE CHART IDS:
  - safety-outcomes
  - safe-abortion-proportion

AVAILABLE FLOW MODEL TYPES:
  - summary (high-level)
  - full (standard detail)
  - full-detail (all intermediate steps)

────────────────────────────────────────────────────────────
  EXECUTIVE SUMMARY
────────────────────────────────────────────────────────────

BASELINE:
  Unintended pregnancies: 50,000
  Seeking abortion: 40,000 (80.0%)
  Safe abortions: 28,000 (70.0% of all abortions)

SCENARIO IMPACTS:

Improved Access:
  Safe abortions: 32,000 [+4,000 (+14%)]
  Safe abortion proportion: 80.0% [+10.0pp]
  Facility access: 30,000 [+5,000 (+20%)]
```

---

### `getReadableTextFromChart(chartConfig, results)`

**Purpose**: Convert chart data to structured text with comparisons

**Example output**:
```
CHART: safety-outcomes
Description: Safety outcomes comparing safe, less safe, and least safe abortions

Baseline (BASELINE):
  Safe abortion:           28,000  (70.0%)
  Less safe abortion:       9,000  (22.5%)
  Least safe abortion:      3,000  (7.5%)
  Total abortions:         40,000
```

---

### `getReadableTextFromTable(results)`

**Purpose**: Complete results table with all metrics

**Example output**:
```
RESULTS TABLE

Scenarios: Baseline, Scenario 1

═══════════════════════════════════════════════════
  PREGNANCIES
═══════════════════════════════════════════════════

Unintended pregnancies:
  Baseline: 50,000
  Scenario 1: 45,000 [-5,000 (-10%)]
```

---

### `getReadableTextFromFlow(flowData, scenarioName, modelType, baseline?, scenarioId?)`

**Purpose**: Flow diagram as tree structure

**Example output**:
```
FLOW DIAGRAM: Summary (model_type: summary)
Scenario: Baseline (id: baseline-uuid-123)

PATHWAY STRUCTURE:

Unintended pregnancies: 50,000
├─→ Seek induced abortion: 40,000 (80%)
│   ├─→ Safe abortion: 28,000 (70% of abortions)
│   ├─→ Less safe abortion: 9,000 (22.5% of abortions)
│   ├─→ Least safe abortion: 3,000 (7.5% of abortions)
│   └─→ No abortion: 0
└─→ Do not seek: 10,000 (20%)
```

## IDs for AI Tools

All text outputs include relevant IDs that AI tools can use for selection and manipulation:

- **Scenario IDs**: Each scenario is listed with its ID (e.g., `id: scenario-uuid-456`)
- **Chart IDs**: Available chart IDs are listed (`safety-outcomes`, `safe-abortion-proportion`)
- **Flow Model Types**: Available model types are listed (`summary`, `full`, `full-detail`)

This allows AI assistants to reference specific scenarios, charts, and visualizations when making tool calls.

## Debug View in Development

In development mode, a debug pane is available in the AI assistant:

1. Start dev server: `npm run dev`
2. Open AI pane
3. Click **"Debug" button** in header
4. Switch to **"Debug Text" tab**
5. Use **MultiSelect controls** to configure output:
   - Include Sections: Choose which sections to include
   - Flow Detail Level: Select flow diagram detail
6. **Copy button** to copy the text

## Design Principles

1. **Hierarchical structure** - Clear sections with consistent headers
2. **Context-rich** - Labels and units embedded with data
3. **Comparison-aware** - Automatic baseline deltas
4. **Scannable** - Right-aligned numbers, left-aligned labels
5. **Semantic grouping** - Related metrics grouped logically
6. **ID inclusion** - All relevant IDs included for AI tool use

## Use Cases

- **AI tool context**: Provide results overview for AI assistants
- **Report generation**: Create narrative summaries from data
- **Analysis**: Feed structured data to analysis tools
- **Documentation**: Generate human-readable result descriptions
- **Debugging**: Verify what the AI sees in the debug pane
