docker compose --env-file ./env/$1.env config
docker compose --env-file ./env/$1.env up --detach
export NODE_ENV=$1

if [ "$1" = "dev" ]
then 
    npm run start
else
    npm run start:prod
fi