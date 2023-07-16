tenant_id=${12}

echo "========== Initialize working folder =========="
mkdir -p temp && cd ./temp
mkdir -p $tenant_id && cd ./$tenant_id
git clone https://github.com/TH-Logistic/infrastructure-dev.git infrastructure
cd infrastructure && git pull

echo $pwd # Inside infrastructure folder
echo "========== Running terraform version =========="
terraform version

echo "========== Running terraform init =========="
terraform init

echo "========== Store tfvars =========="

rm -f .tfvars

cat <<EOT >> .tfvars
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

tenant_unique_id = "${12}"

root_user="${13}"
root_password="${14}"
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

terraform apply -var-file .tfvars -auto-approve

if [ $? -ne 0 ]
then
  echo "Apply Failed!"
  exit 1
else
  echo "Apply Successful!"
fi

exit 0