# Terraform & Terragrunt Generator (Azure Static Web App + Azure Functions + Azure OpenAI)

## Prerequisites
- Azure Subscription
- Azure OpenAI resource (get endpoint, key, and deployment name)
- Node.js, Python 3.9+, Azure CLI

## Setup

### 1. Clone the repo
```
git clone <your-repo-url>
cd terraform-Generator
```

### 2. Configure Azure OpenAI environment variables
Set these in Azure portal for your Function App:
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_KEY`
- `AZURE_OPENAI_DEPLOYMENT` (e.g., "gpt-35-turbo")

### 3. Local Development

#### Frontend
```
cd frontend
npm install
npm start
```

#### Backend
```
cd ../api
pip install -r requirements.txt
func start
```

### 4. Deploy to Azure Static Web Apps
- Push to GitHub.
- In Azure Portal, create a Static Web App, link your repo.
- Set `app_location` to `frontend`, `api_location` to `api`.

## Usage
- Visit your Static Web App URL.
- Enter provider and service, click Generate.
- Get Terraform and Terragrunt scripts!

---

**Cost-saving tips:**  
- Use GPT-3.5 for most requests.  
- Azure Static Web Apps and Functions have generous free tiers.

---

## Extend
- Add authentication (Azure AD).
- Add script download, history, or user accounts.
- Add more prompt options (custom variables, etc). 