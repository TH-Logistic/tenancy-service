FROM --platform=linux/amd64 node:18

# Install Git
RUN apt-get -y update
RUN apt-get -y install git


# Install Terraform
RUN apt-get update && apt-get install -y gnupg software-properties-common
RUN wget -O- https://apt.releases.hashicorp.com/gpg | \
    gpg --dearmor | \
    tee /usr/share/keyrings/hashicorp-archive-keyring.gpg

RUN gpg --no-default-keyring \
--keyring /usr/share/keyrings/hashicorp-archive-keyring.gpg \
--fingerprint

RUN echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \
    https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \
    tee /etc/apt/sources.list.d/hashicorp.list

RUN apt update
RUN apt-get install terraform

# Start with containerizing code
WORKDIR /code

COPY package.json .
COPY package-lock.json .

RUN npm i

COPY . .

EXPOSE 3000

RUN npm run build
CMD [ "npm", "run", "start:prod" ]