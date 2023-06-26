#!bin/bash

aws_access_key=$1
aws_secret_key=$2
aws_session_token=$3
tenant_id=$4

echo "========== Running terraform version =========="
docker run --rm -t hashicorp/terraform:1.5.1 version

echo "========== Running terraform apply destroy =========="
docker run \
    -v "$(pwd)"/temp/"$tenant_id"/infrastructure:/infrastructure \
    --rm -t hashicorp/terraform:1.5.1 \
    -chdir=/infrastructure destroy \
    -var-file .tfvars \
    -var aws_access_key=$aws_access_key \
    -var aws_secret_key=$aws_secret_key \
    -var aws_session_token=$aws_session_token \
    -auto-approve

if [ $? -ne 0 ]
then
  echo "Destroy Failed!"
  exit 1
else
  echo "Destroy Successful!"
fi

exit 0