#!bin/bash

echo "========== Initialize script =========="
mkdir -p temp
cd ./temp
git clone https://github.com/TH-Logistic/infrastructure.git
cd infrastructure
git pull

# Back to parent folder
cd ../../

echo "========== Running terraform version =========="
docker run --rm -t hashicorp/terraform:latest version

# echo "========== Running terraform init =========="

# docker run \
#     --rm \
#     -t \
#     -v "$(pwd)"/temp/infrastructure:/infrastructure \
#     hashicorp/terraform:latest -chdir=/infrastructure init

aws_access_key=$1
aws_secret_key=$2
aws_session_token=$3
aws_region=$4
key_pair_name=$5
mongo_db_name=$6
mongo_username=$7
mongo_password=$8
app_secret=$9
rds_db_name=${10}
rds_username=${11}
rds_password=${12}
tenant_id=${13}

echo "========== Running terraform plan =========="
docker run \
    -v "$(pwd)"/temp/infrastructure:/infrastructure \
    -t hashicorp/terraform:latest -chdir=/infrastructure plan \
    -out $tenant_id \
    -var aws_access_key=$aws_access_key \
    -var aws_secret_key=$aws_secret_key \
    -var aws_session_token=$aws_session_token \
    -var aws_region=$aws_region \
    -var key_pair_name=$key_pair_name \
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
    --rm -t hashicorp/terraform:latest -chdir=/infrastructure apply \
    -auto-approve \ 
    -var aws_access_key=$aws_access_key \
    -var aws_secret_key=$aws_secret_key \
    -var aws_session_token=$aws_session_token \
    -var aws_region=$aws_region \
    -var key_pair_name=$key_pair_name \
    -var mongo_db_name=$mongo_db_name \
    -var mongo_username=$mongo_username \
    -var mongo_password=$mongo_password \
    -var app_secret=$app_secret \
    -var rds_db_name=$rds_db_name \
    -var rds_username=$rds_username \
    -var rds_password=$rds_password \
    $tenant_id

exit 0