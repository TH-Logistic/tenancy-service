VERSION=$1
REGISTRY=registry.thinhlh.com
docker build -f ./docker/app/Dockerfile --tag $REGISTRY/tenant_service:${VERSION} .

docker push $REGISTRY/tenant_service:${VERSION}

# Perform remote deploy with docker context
# 1. Create a context | 
    # docker create context context-name --docker "host=ssh://user@server-address"
    # You can config ssh key by setting the ssh inside ssh key config file ~/.ssh/config
    
# 2. Then run all commands with --context context-name like normally

# https://www.docker.com/blog/how-to-deploy-on-remote-docker-hosts-with-docker-compose/

docker-compose --context remote-server-thinhlh down tenant_service --rmi all --volumes
docker-compose --context remote-server-thinhlh --env-file ./env/.env.prod up -d tenant_service
docker-compose --context remote-server-thinhlh logs --follow
