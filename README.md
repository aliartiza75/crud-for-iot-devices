# IoT Device CRUD

## Overview

This repository holds the manifests for the API of the IoT Device CRUD.

## Folder Structure

```bash
├── app.js  # configuration for server
├── bin 
│   └── server-start  # server starting component
├── controllers  # controllers handles the user requests
│   ├── AuthController.js
│   ├── DeviceController.js
│   └── FeedController.js
├── helpers  # helpers are used in controllers
│   ├── apiResponse.js
│   └── utility.js
├── middlewares  # intercepts the requests and validate jwt token
│   └── jwt.js
├── models  # models
│   ├── DeviceModel.js
│   ├── FeedModel.js
│   └── UserModel.js
├── mqtt-python-client # mqtt clients
│   ├── configure_env.sh
│   ├── consumer.py
│   ├── producer.py
│   ├── README.md
│   └── requirements.txt
├── package.json  # packages information
├── package-lock.json
├── postman-collection  # collection of api endpoints
│   └── api.json
├── README.md  # documentation
└── routes  # api routes
    ├── api.js
    ├── auth.js
    ├── device.js
    ├── feed.js
    └── index.js
```

## Deployment Guidelines


Following the guidelines to start the server:


1. Install node and npm.

2. Install packages

```bash
npm install
```

3. Convert the `.env.example` to `.env` file because server use the configuration provided in this file.

4. Start mongodb server as a docker container:

```bash
sudo docker run -d \
    -e MONGO_INITDB_ROOT_USERNAME=mongoadmin \
    -e MONGO_INITDB_ROOT_PASSWORD=secret \
    -p 27017:27017 \
    mongo
```

5. Run the lint to check any linting issue:

```bash
npm run lint
```


6. To start the server:

```bash
npm run dev
```

7. Import the postman collection in the Postman application to use the api endpoints.
