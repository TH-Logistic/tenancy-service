#!bin/bash

tenant_id=${12}

echo "========== Initialize scripts =========="
mkdir -p temp && cd ./temp
mkdir -p $tenant_id && cd ./$tenant_id
git clone https://github.com/TH-Logistic/infrastructure-dev.git infrastructure
cd infrastructure && git pull && cd ..

# temp -> tenant_id -> infrastructure
# Back to parent folder
cd ../../

echo "========== Running terraform version =========="
docker run --rm -t hashicorp/terraform:1.5.1 version

echo "========== Running terraform init =========="

docker run \
    --rm \
    -t \
    -v "$(pwd)"/temp/"$tenant_id"/infrastructure:/infrastructure \
    hashicorp/terraform:1.5.1 -chdir=/infrastructure init

rm -rf "$(pwd)"/temp/"$tenant_id"/infrastructure/.tfvars

cat <<EOT >> "$(pwd)"/temp/"$tenant_id"/infrastructure/.tfvars
tenant_unique_id = "${12}"

aws_access_key = "$1"
aws_secret_key = "$2"
aws_session_token = "$3"
aws_region = "$4"

mongo_db_name = "$5"
mongo_username = "$6"
mongo_password = "$7"

app_secret = "$8"

rds_db_name="${9}"
rds_username="${10}"
rds_password="${11}"
EOT

# echo "========== Running terraform plan =========="
# docker run \
#     -v "$(pwd)"/temp/"$tenant_id"/infrastructure:/infrastructure \
#     --rm -t hashicorp/terraform:1.5.1 -chdir=/infrastructure plan \
#     -out tfplans/$tenant_id.tfplan \
#     -var-file .tfvars
    # -var aws_access_key=$aws_access_key \
    # -var aws_secret_key=$aws_secret_key \
    # -var aws_session_token=$aws_session_token \
    # -var aws_region=$aws_region \
    # -var tenant_unique_id=$tenant_id \
    # -var mongo_db_name=$mongo_db_name \
    # -var mongo_username=$mongo_username \
    # -var mongo_password=$mongo_password \
    # -var app_secret=$app_secret \
    # -var rds_db_name=$rds_db_name \
    # -var rds_username=$rds_username \
    # -var rds_password=$rds_password

# echo "========== Running terraform plan for destroy =========="
# docker run \
#     -v "$(pwd)"/temp/"$tenant_id"/infrastructure:/infrastructure \
#     --rm -t hashicorp/terraform:1.5.1 -chdir=/infrastructure plan \
#     -destroy \
#     -out tfplans/$tenant_id.tfplan \
#     -var aws_access_key=$aws_access_key \
#     -var aws_secret_key=$aws_secret_key \
#     -var aws_session_token=$aws_session_token \
#     -var aws_region=$aws_region \
#     -var tenant_unique_id=$tenant_id \
#     -var mongo_db_name=$mongo_db_name \
#     -var mongo_username=$mongo_username \
#     -var mongo_password=$mongo_password \
#     -var app_secret=$app_secret \
#     -var rds_db_name=$rds_db_name \
#     -var rds_username=$rds_username \
#     -var rds_password=$rds_password

echo "========== Running terraform apply =========="

docker run \
    -v "$(pwd)"/temp/"$tenant_id"/infrastructure:/infrastructure \
    --rm -t hashicorp/terraform:1.5.1 \
    -chdir=/infrastructure apply \
    -var-file .tfvars \
    -auto-approve

if [ $? -ne 0 ]
then
  echo "Apply Failed!"
  exit 1
else
  echo "Apply Successful!"
fi

exit 0