#!bin/bash

echo "========== Running terraform version =========="
docker run --rm -t hashicorp/terraform:latest version

echo "========== Running terraform destroy plan =========="
docker run \
    -v "$(pwd)"/temp/infrastructure:/infrastructure \
    --rm -t hashicorp/terraform:1.5.1 -chdir=/infrastructure plan \
    -input=false \
    -destroy \
    -out tfplans/$tenant_id-destroy.tfplan \
    -var aws_access_key=$aws_access_key \
    -var aws_secret_key=$aws_secret_key \
    -var aws_session_token=$aws_session_token

echo "========== Running terraform apply destroy =========="
docker run \
    -v "$(pwd)"/temp/infrastructure:/infrastructure \
    --rm -t hashicorp/terraform:1.5.1 \
    -chdir=/infrastructure apply /infrastructure/tfplans/$tenant_id-destroy.tfplan

exit 0