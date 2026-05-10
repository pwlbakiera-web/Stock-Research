---
name: stock-research
description: >
  Runs MiroThinker autonomous web research agent to verify a specific investment
  claim or question about a company. Use when user invokes /stock-research,
  wants to verify something from an earnings call, check competitor data,
  or research user sentiment/market context for a company being analyzed.
---

# Stock Research — Web Verification Agent

Answers a specific investment question by autonomously searching the web. Best used mid-analysis when something needs external verification — competitor data, user sentiment, market context, news.

## When to use

- "CEO said X — is that true?"
- "How does this compare to competitors?"
- "What do users actually think about this product?"
- "What's happening in this market/region?"
- "What are analysts saying about this?"

Not needed for: financial data (fiscal.ai), earnings call content (NotebookLM).

## Usage

```
/stock-research [company] [specific question to verify]
```

Examples:
```
/stock-research Sea Limited  Is Shopee actually growing in Brazil or losing to Mercado Libre?
/stock-research Duolingo  What do users say about learning quality — do they actually learn the language?
/stock-research Sea Limited  What promotions and subsidies does Shopee offer vs TikTok Shop in SEA?
```

## Step-by-step

1. **Get inputs** — company + verification question. If user provides context from their analysis (e.g. "CEO said X"), include it in the prompt.

2. **Build research prompt** using this template:

```
You are an investment analyst verifying a specific claim or question through web research.

Company: [COMPANY]
Question to verify: [QUESTION]
[If user provided context: "Context from analysis: [CONTEXT]"]

Search the web to answer this question. Focus on:
- Sources from the last 12 months
- Multiple independent sources (not just company IR)
- User/customer perspective where relevant (forums, app reviews, social media)
- Competitor data and market share where relevant
- Analyst and journalist commentary
- Local market sources if region-specific

Structure your findings as:
1. Direct answer to the question (1-2 sentences)
2. Supporting evidence (bullet points with exact data points, dates, and full source URLs)
3. Contradicting evidence or caveats (if any), with sources and URLs
4. Confidence level: HIGH / MEDIUM / LOW and why

Be specific — for every data point include: the exact number, date, and the source as a markdown hyperlink using only the domain name as anchor text, e.g. [metric.vn](https://metric.vn/specific-article-path). The URL must point to the specific article or report page, NOT the homepage or domain root.
```

3. **Show prompt to user** — before running the agent, always present the constructed prompt with a brief comment (1-2 sentences) explaining why you framed it that way. Wait for approval or corrections. Only proceed after "ok" / "go ahead".

4. **Update main.py** — edit `[your-path]/MiroThinker\apps\miroflow-agent\main.py`:
   - `task_id` → snake_case of company+topic (e.g. `sea_brazil_verification`)
   - `task_description` → constructed prompt above

5. **Run agent** via PowerShell (run in background):
```powershell
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "User") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "Machine")
$env:OPENAI_API_KEY = "YOUR_GEMINI_API_KEY"
$env:OPENAI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
$env:SERPER_API_KEY = "YOUR_SERPER_API_KEY"
$env:JINA_API_KEY = "YOUR_JINA_API_KEY"
$env:SUMMARY_LLM_API_KEY = "YOUR_GEMINI_API_KEY"
$env:SUMMARY_LLM_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
$env:SUMMARY_LLM_MODEL_NAME = "gemini-3-flash-preview"
cd "[your-path]/MiroThinker\apps\miroflow-agent"
uv run python main.py llm=gemini agent=no_e2b
```

6. **Parse and present results** — when agent completes, read output and:
   - Present the findings clearly
   - Compare with any context user provided from their analysis
   - Flag where web findings confirm, contradict, or add nuance to what they already know
   - Give a clear verdict: verified / not verified / mixed evidence

## Config reference

- MiroThinker: `[your-path]/MiroThinker\apps\miroflow-agent\`
- task_description line: ~32 in main.py
- LLM: gemini-3-flash-preview
- Agent config: no_e2b (Google Search + Jina, no code sandbox)
- Cost: ~$0.05–0.10 per question
- Time: 3–6 minutes

