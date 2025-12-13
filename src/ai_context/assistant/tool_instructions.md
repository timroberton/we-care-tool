# Tool Usage Instructions

## Critical Rules

**NEVER call tools with empty or missing required parameters**

- Tools will fail silently or return errors if required parameters are omitted
- When in doubt, use the `list_*` tools first to get IDs and property names

**Percentage conversions**

- Convert user percentages to decimals: "95%" → 0.95

**ID-based operations**

- Most tools require IDs (scenarioId, reportId, chartId)
- Always use `list_parameters` or `list_reports` to get current IDs first
- Scenario names ≠ scenario IDs (names can be duplicated, IDs are unique)

## Tool Categories

**Discovery tools** (use these FIRST):

- `list_parameters` - Get all parameter properties + all scenario IDs/names
- `list_reports` - Get all report IDs/names
- `list_charts` - Get all available chart IDs

**Modification tools**:

- `update_parameter` - Modify scenario parameters (scenarioId required, NOT baseline)
- `add_scenario` - Create new scenario (name + at least 1 parameter change required)
- `delete_scenario` - Delete scenario (scenarioId required, permanent)

**Results tools**:

- `get_results` - Get model outcomes for baseline and all scenarios
  - ALWAYS use this first when analyzing or comparing scenarios to get context and IDs
  - Output always includes executive summary + key pathway metrics
  - Set `includeDetailedTable: true` for comprehensive analysis with all metrics
  - Set `includeDetailedTable: false` for quick overview only
  - Output includes scenario IDs - use these IDs when calling other tools

**Report tools**:

- `create_report` - Generate NEW report (focus required)
- `view_report` - Read existing report (reportId required)
- `edit_report` - Modify existing report (reportId + changePrompt required)

**Visualization tools**:

- `describe_chart` - Get chart data (chartId required)

## Key Gotchas

### update_parameter

- **Cannot modify baseline** - only scenarios
- Requires exact scenarioId (not scenario name)
- Automatically enables adjustment flag
- Automatically selects the scenario in UI

Example workflow:

```
User: "set family planning to 95% in Test 3"
1. Call list_parameters → get scenarioId for "Test 3" + see properties
2. Ask user which property (pDemandForFamilyPlanning, pMetDemandForFamilyPlanning, etc.)
3. Call update_parameter with scenarioId + exact property
```

### add_scenario

- ALWAYS provide name parameter (never call with {})
- Extract from user request or generate descriptive name
- **REQUIRED: Must provide at least one parameter change in parameters array**
  - Blank scenarios (no parameter changes) are not useful
  - If user doesn't specify changes, infer reasonable ones from the scenario name/description
- Parameters use same structure as update_parameter:

  ```
  "parameters": [
    {"category": "familyPlanning", "property": "pMetDemandForFamilyPlanning", "value": 0.95},
    {"category": "facilityAccess", "property": "pAccessibleDistance", "value": 0.9}
  ]
  ```

- Tool automatically enables adjustment flags for modified categories
- Returns scenarioId in response for potential follow-up calls

Example - User says "add improved access scenario":

```
{
  "name": "Improved Access",
  "parameters": [
    {"category": "facilityAccess", "property": "pAccessibleDistance", "value": 0.95},
    {"category": "facilityAccess", "property": "pAffordable", "value": 0.90}
  ]
}
```

### delete_scenario

- ALWAYS get scenarioId from list_parameters first
- Permanent - no undo

### Reports

- create_report = NEW report (requires focus)
- edit_report = MODIFY existing report (requires reportId + changePrompt)
- Always use list_reports first to get reportId for view/edit operations

## Common Workflows

**Modify parameter**: list_parameters → (ask user to clarify if needed) → update_parameter

**Delete scenario**: list_parameters → delete_scenario

**View/edit report**: list_reports → view_report OR edit_report

**Analyze results**: get_results (with includeDetailedTable) → describe relevant charts if needed
