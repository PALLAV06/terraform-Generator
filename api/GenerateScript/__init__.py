import os
import azure.functions as func
import openai
import json

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()
        provider = req_body.get("provider")
        service = req_body.get("service")
        custom_prompt = req_body.get("customPrompt", "")
        if not provider or not service:
            return func.HttpResponse(
                json.dumps({"error": "Missing provider or service"}),
                status_code=400,
                mimetype="application/json"
            )

        # Azure OpenAI setup (new SDK)
        client = openai.AzureOpenAI(
            api_key=os.environ["AZURE_OPENAI_KEY"],
            api_version="2023-05-15",
            azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"]
        )

        # Use custom prompt if provided, else default
        if custom_prompt and custom_prompt.strip():
            prompt = custom_prompt.strip()
        else:
            prompt = (
                f"Generate a Terraform script for the {provider.upper()} service '{service}'. "
                f"Then, generate a corresponding Terragrunt configuration file for the same resource. "
                f"Output both scripts in separate code blocks, clearly labeled as Terraform and Terragrunt. "
                f"Use best practices and reference the latest HashiCorp documentation."
            )

        # Call Azure OpenAI (GPT-3.5-turbo or specified deployment)
        response = client.chat.completions.create(
            model=os.environ.get("AZURE_OPENAI_DEPLOYMENT", "gpt-35-turbo"),
            messages=[
                {"role": "system", "content": "You are a helpful assistant that generates both Terraform and Terragrunt scripts for cloud infrastructure."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1200,
            temperature=0.2,
        )
        result = response.choices[0].message.content.strip()
        return func.HttpResponse(
            json.dumps({"result": result}),
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json"
        ) 