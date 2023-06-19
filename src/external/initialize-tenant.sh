#!bin/bash

echo "========== Initialize script =========="
mkdir -p temp
cd ./temp
git clone https://github.com/TH-Logistic/infrastructure.git
cd infrastructure
git pull

echo "========== Running terraform version =========="
docker run --rm -t hashicorp/terraform:latest version

echo "========== Running terraform init =========="
docker run \
    --rm \
    -t \
    --mount type=bind,source="$(pwd)"/temp/infrastructure/,target=/app/infrastructure/ \
    hashicorp/terraform:latest \
    -chdir=. init 
    

echo "========== Running terraform plan =========="
# docker run --rm -t hashicorp/terraform:latest plan