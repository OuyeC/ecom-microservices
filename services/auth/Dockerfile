# pick a slim node.js base image, node:18-alpine is an official node.js image in alpine linux
FROM node:18-alpine    


# create & switch to a working directory in the container, set /app as the working directory for all subsequent instructions
WORKDIR /app

# copy dependency definitions files to container directory
COPY package.json package-lock.json ./

# install dependencies via npm
RUN npm ci

# copy rest src/ into /app/src
COPY src ./src

# expose the port your service listens on
EXPOSE 4000

# define startup command when container starts
CMD ["node", "src/index.js"]