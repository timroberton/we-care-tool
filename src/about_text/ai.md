# AI Assistant

We Care includes an AI assistant powered by Claude (Anthropic) to help analyze scenarios, modify parameters, and generate reports through natural language conversation.

## How the AI is Instructed

**We explicitly instruct the AI about critical model limitations:**

> **Model limitations**: This model provides a simplified representation of abortion care pathways and does not reflect the full complexity of real-world health systems. Use results as insights for exploration and planning, not as definitive predictions.
>
> **Unreliable inputs**: Input data may be incomplete, outdated, or unreliable.
>
> **Use caution**: All results must be presented with appropriate caution and caveats.
>
> **Flag extremes**: Scenarios with extreme parameter values (e.g., 100%) should be explicitly noted as unrealistic.

The AI is told to acknowledge these limitations in its analysis and avoid overstating confidence in results.

## What the AI Can Do

**Analyze and compare scenarios:**

- Explain differences in safety outcomes between scenarios
- Identify key drivers of changes (cascade effects)
- Compare intervention impacts

**Modify parameters:**

- Update parameter values in scenarios
- Create new scenarios
- Delete scenarios

**Generate reports:**

- Create comprehensive reports with embedded charts
- Edit existing reports
- Export analysis with visualizations

**Example prompts:**

- "What's driving the difference between baseline and scenario 1?"
- "Create a scenario with 90% met need for family planning"
- "Generate a report comparing all scenarios"
- "Which intervention has the biggest impact on unsafe abortions?"

## What the AI Knows

The AI has been provided with:

- WHO Abortion Care Guideline, Second edition (2025) context and recommendations
- Complete model methodology (calculation cascade, access barriers, safety classifications)
- All parameter definitions and model assumptions
- Your current project's results and parameters

## Limitations

The AI cannot:

- Access external data beyond what's in the tool
- Determine the accuracy of the input data
- Modify baseline parameters (only scenarios)
- Make definitive policy decisions
- Run statistical tests or uncertainty analyses

## Privacy

**Local storage**: All calculations and data stored in your browser
**AI interactions**: Your prompts and model results are sent to Anthropic's API when using AI features
**No persistence**: Conversations are not stored server-side; reports save only generated content locally
