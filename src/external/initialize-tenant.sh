#!bin/bash

echo "========== Initialize script =========="
mkdir -p temp
cd ./temp
git clone https://github.com/TH-Logistic/tenant-infrastructure.git infrastructure
cd infrastructure
git pull

# Create tfplans folder
mkdir -p tfplans

# Back to parent folder
cd ../../

echo "========== Running terraform version =========="
docker run --rm -t hashicorp/terraform:1.5.1 version

echo "========== Running terraform init =========="

docker run \
    --rm \
    -t \
    -v "$(pwd)"/temp/infrastructure:/infrastructure \
    hashicorp/terraform:1.5.1 -chdir=/infrastructure init

aws_access_key=$1
aws_secret_key=$2
aws_session_token=$3
aws_region=$4
mongo_db_name=$5
mongo_username=$6
mongo_password=$7
app_secret=$8
rds_db_name=${9}
rds_username=${10}
rds_password=${11}
tenant_id=${12}

echo "========== Running terraform plan =========="
docker run \
    -v "$(pwd)"/temp/infrastructure:/infrastructure \
    --rm -t hashicorp/terraform:1.5.1 -chdir=/infrastructure plan \
    -out tfplans/$tenant_id.tfplan \
    -var aws_access_key=$aws_access_key \
    -var aws_secret_key=$aws_secret_key \
    -var aws_session_token=$aws_session_token \
    -var aws_region=$aws_region \
    -var tenant_unique_id=$tenant_id \
    -var mongo_db_name=$mongo_db_name \
    -var mongo_username=$mongo_username \
    -var mongo_password=$mongo_password \
    -var app_secret=$app_secret \
    -var rds_db_name=$rds_db_name \
    -var rds_username=$rds_username \
    -var rds_password=$rds_password

echo "========== Running terraform apply =========="

docker run \
    -v "$(pwd)"/temp/infrastructure:/infrastructure \
    --rm -t hashicorp/terraform:1.5.1 \
    -chdir=/infrastructure apply /infrastructure/tfplans/$tenant_id.tfplan

exit 0