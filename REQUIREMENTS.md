# Project Requirements for Full AI Features

To upgrade this project from a "Rule-based Simulator" to a fully "AI-Powered Assistant" as per the assignment, the following external services are required.

## 1. OpenAI API Key (Required for Agents)
We need access to GPT-4o or GPT-3.5-Turbo to power the agents.

- **Variable Name:** \`VITE_OPENAI_API_KEY\`
- **Purpose:** 
  - **Supervisor Agent:** Classifies user intent (Job Search vs Profile Update).
  - **Profile Manager:** Extracts structured data (Name, City, Salary) from natural language.
  - **Job Matcher:** Generates embeddings for semantic search.

## 2. Supabase Vector Extension (Required for Job Matching)
To perform "Semantic Search" (finding jobs by meaning, not just keywords), we need to enable the Vector extension in Supabase.

**Steps:**
1. Go to your Supabase Dashboard -> SQL Editor.
2. Run this query:
   \`\`\`sql
   create extension if not exists vector;
   \`\`\`
3. (Optional) We will need to create a migration to add a \`embedding\` column to the \`jobs\` and \`profiles\` tables.

## 3. WhatsApp Cloud API (For Production Deployment)
*Note: Cannot be tested inside WebContainer environment.*

To connect to real WhatsApp:
1. Create a Meta Developer App.
2. Add "WhatsApp" product.
3. Get **Phone Number ID** and **Permanent Access Token**.
4. Configure Webhook URL to point to your deployed backend (e.g., on Render/Heroku).
