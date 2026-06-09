# Leadsora - Application Architecture & Feature Documentation

## Overview
Leadsora is an AI-powered B2B lead generation and outreach automation platform. It is designed to find companies with confirmed budgets and immediate technical pain, score them, discover decision-makers, and autonomously generate hyper-personalized, context-aware outreach.

---

## 1. Core Scanning Engine (Lead Extraction)

### Description
The core engine scans multiple sources to identify companies that exhibit specific "buying signals." It does not rely on static databases, but rather live signals indicating urgency.

### Scan Modes & Logic
*   **🔥 Hiring Intent (Actively Hiring):** Looks for companies with open technical roles, indicating confirmed budget.
*   **🎯 Layoff Sniper (Layoffs.fyi Live):** Tracks recent restructuring. Logic: Companies that lay off full-time staff often need fractional or agency support to maintain output without fixed headcount costs.
*   **🐋 VC Whales (VC Funding):** Tracks recent funding rounds. Logic: Investors expect hyper-growth, meaning immediate budget deployment for scaling.
*   **⏳ Stale Jobs:** Finds roles sitting unfilled for 60+ days. Logic: Desperation is high, and the workload is piling up, making them prime targets for immediate fractional intervention.
*   **🕵️ Defection Signals:** Monitors G2 reviews or outages indicating dissatisfaction with current vendors.

---

## 2. Hiring Manager Detection Engine

### Description
Instead of generic "info@company.com" emails, this engine autonomously hunts for the senior technical decision-maker (CTO, VP of Engineering, CEO) for any given company.

### Logic & API Integration
*   **Endpoint:** `/api/find-hiring-manager`
*   **Domain Resolution:** Converts company names into domains using a fallback chain (Known dictionaries → URL extraction → TLD guessing like `.com`, `.io`, `.ai`).
*   **API Integration:** Integrates with **Hunter.io** (`/v2/domain-search`) to fetch all known emails for the resolved domain.
*   **Seniority Scoring Algorithm:** Runs a custom algorithm (`seniorityScore`) over the returned contacts. Titles like "CTO" score 100, "Founder" 95, down to "Manager" 45. The highest-scoring contact is returned as the primary target.

---

## 3. Deep Dive Company Analysis (AI Intelligence)

### Description
Before generating outreach, Leadsora conducts autonomous research on the target company to understand its business model, recent news, and tech stack.

### Logic & API Integration
*   **Endpoint:** `/api/analyze-company`
*   **Data Gathering (Tavily):** Uses the **Tavily Search API** to execute an advanced search query (`What does the company X do? What is their recent news, funding, tech stack?`).
*   **AI Summarization (NVIDIA NIM):** Feeds the raw search results into **Llama-3.1-70B-Instruct** (via NVIDIA NIM API) with a strict system prompt to output a structured JSON report.
*   **Output:** Returns a detailed JSON object containing `summary`, `recent_news`, `tech_stack`, and `ideal_customer`.

---

## 4. Omnichannel Outreach Generation

### Description
Generates highly personalized, context-aware cold emails that prove the sender did their homework.

### Logic & API Integration
*   **Endpoint:** `/api/generate-outreach`
*   **Prompt Engineering:** The prompt is dynamically assembled based on the active `Scan Mode` (e.g., the tone shifts to empathy for 'layoffs', and high-energy for 'vc whales').
*   **Context Injection:** It weaves in the user's `Auto-Extracted Value Proposition` (from their profile) AND the `Deep Dive Company Context` (from the Tavily analysis).
*   **AI Integration:** Uses a robust failover loop with **NVIDIA NIM**. It tries `meta/llama-3.1-70b-instruct`, then falls back to `mixtral-8x22b-instruct` or `llama3-8b-instruct` if network errors occur.
*   **Pitch Links:** Automatically appends a custom "ROI Pitch Deck" URL (e.g., `leadsora.vercel.app/pitch/acme-corp/frontend-engineer`).

---

## 5. Ghost Mode (Autonomous Background Scanning)

### Description
Ghost mode acts as an autonomous sales development representative (SDR) that hunts for leads while the user sleeps.

### Logic & API Integration
*   **Endpoint:** `/api/cron/ghost-mode`
*   **Trigger:** Executed via Vercel Cron Jobs every hour.
*   **Database:** Uses **Upstash Redis** to store user configurations (`ghostConfig_email`) and track previously saved leads (`savedLeads_email`) to prevent duplicates.
*   **Execution:** 
    1. Checks if the current UTC hour matches the user's configured `Daily Scan Time`.
    2. Runs a background scan using the user's target keywords.
    3. Filters out only the "Whales" (leads with an AI Intent Score >= 90).
    4. Deduplicates against the Redis database.
    5. Saves new leads and fires a **Slack Webhook** to notify the user instantly.

---

## 6. Dynamic Pitch Pages

### Description
Leadsora generates personalized landing pages for outreach targets. When a lead clicks the link in their email, they see a page dedicated entirely to their company and role.

### Logic
*   **Routing:** Utilizes Next.js catch-all dynamic routes (`/pitch/[[...slug]]`).
*   **Personalization:** The slug translates directly into a personalized headline (e.g., "Custom Fractional Roadmap for Acme Corp"). It parses URL parameters (`?e=email`) to display the sender's contact information dynamically.

---

## Summary of External APIs
1.  **NVIDIA NIM API:** Used for Llama 3.1 70B inference (Company Analysis and Outreach Generation).
2.  **Tavily Search API:** Used for deep-dive web scraping and intelligence gathering on companies.
3.  **Hunter.io API:** Used for Domain Search and discovering executive email addresses.
4.  **Upstash Redis:** Used as the primary KV store for Ghost Mode configurations and lead deduplication.
5.  **Slack Webhooks:** Used for real-time notifications of high-intent lead discoveries.
