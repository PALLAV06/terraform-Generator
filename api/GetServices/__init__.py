import azure.functions as func
import json
import requests

def main(req: func.HttpRequest) -> func.HttpResponse:
    provider = req.params.get("provider")
    if not provider:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            provider = req_body.get("provider")
    if not provider:
        return func.HttpResponse(
            json.dumps({"error": "Missing provider"}),
            status_code=400,
            mimetype="application/json"
        )
    provider_map = {
        "azure": "azurerm",
        "aws": "aws",
        "oci": "oci"
    }
    registry_provider = provider_map.get(provider)
    if not registry_provider:
        return func.HttpResponse(
            json.dumps({"error": "Invalid provider"}),
            status_code=400,
            mimetype="application/json"
        )
    url = f"https://registry.terraform.io/v1/providers/hashicorp/{registry_provider}/latest/docs/resources"
    try:
        res = requests.get(url, timeout=10)
        data = res.json()
        services = [r["name"] for r in data.get("resources", [])]
        return func.HttpResponse(
            json.dumps({"services": services}),
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json"
        ) 