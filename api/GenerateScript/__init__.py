import os
import azure.functions as func
import openai
import json

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()
        provider = req_body.get("provider")
        service = req_body.get("service")
        if not provider or not service:
            return func.HttpResponse(
                json.dumps({"error": "Missing provider or service"}),
                status_code=400,
                mimetype="application/json"
            )

        # Azure OpenAI setup
        openai.api_type = "azure"
        openai.api_base = os.environ["AZURE_OPENAI_ENDPOINT"]
        openai.api_version = "2023-05-15"
        openai.api_key = os.environ["AZURE_OPENAI_KEY"]

        # Prompt engineering
        prompt = (
            f"Generate a Terraform script and a corresponding Terragrunt configuration "
            f"for deploying a {provider.upper()} {service}. "
            f"Use best practices and reference the latest HashiCorp documentation. "
            f"Output both scripts clearly labeled."
        )

        # Call Azure OpenAI (GPT-3.5-turbo)
        response = openai.ChatCompletion.create(
            engine=os.environ.get("AZURE_OPENAI_DEPLOYMENT", "gpt-35-turbo"),
            messages=[
                {"role": "system", "content": "You are a helpful assistant that generates Terraform and Terragrunt scripts."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800,
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