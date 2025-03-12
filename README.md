# LocalQuest

LocalQuest is a web application that allows users to create, manage, and participate in quests. The application is divided into two main parts: the server (backend) and the client (frontend).

## Table of Contents

- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
  - [Docker](#docker)
    - [Run](#run)
    - [Stop](#stop)
    - [Remove Container](#remove-container)
    - [Remove Image](#remove-image)
    - [Logs](#logs)
    - [Help](#help)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Linting and Formatting](#linting-and-formatting)
- [Testing](#testing)
- [Demo](#demo)
- [License](#license)

## Project Structure

The project is organized into the following directories:

- `server`: Contains the backend code, including API endpoints, database models, and business logic.
- `client`: Contains the frontend code, including React components, pages, and styles.

## Setup Instructions

### Environment Variables

Set up environment variables by creating a `.env` file in the `server` directory. Add the following variables:

```bash
SECRET_KEY="<your-secret-key>"
MONGODB_USERNAME="<your-mongodb-username>"
MONGODB_PASSWORD="<your-mongodb-password>"
MONGODB_CLUSTER="<your-mongodb-cluster>"
MONGODB_ENDPOINT="<your-mongodb-endpoint>"
```

You can also rename the `.env.example` file to `.env` to use the environment variables directly.

### Docker

Execute the following command:

Make sure the bash script has the right permission by running `chmod u+x run.sh`

#### Run

```bash
./run.sh
```

- Builds the Docker image (if not already built)
- Runs the containers (using docker compose, if it isn't already running)
- Opens the app in your default web browser at `http://localhost:5173/`

#### Stop

```bash
./run.sh --stop
```

- Stops the running containers

#### Remove Container

```bash
./run.sh --remove-container
```

- Stops the running containers (if not already stopped)
- Removes the containers

#### Remove Image

```bash
./run.sh --remove-all
```

- Stops the running containers (if not already stopped)
- Removes the containers
- Removes the Docker image

#### Logs

```bash
./run.sh --logs
```

- Shows logs of the running containers

#### Help

```bash
./run.sh --help
```

- Print the help message containing info about the available options

To run it yourself using Docker, you can run the following commands:

```bash
docker compose -f docker-compose.yaml up -d --build
```

You can also individually run the server and client in the next two sections.

### Backend Setup

Navigate to the `server` directory:

```bash
cd server
python -m venv .venv
source .venv/bin/activate # On Windows, use `.venv\Scripts\activate`
pip install -r requirements.txt
```

Start the server

```bash
python server.py
```

### Frontend Setup

```bash
cd client
npm install
npm start
```

Open the frontend on: `http://localhost:5173`

## Linting and Formatting

To lint and format the backend code, you can use the provided `lint_and_format.sh` script:

```bash
cd server
./lint_and_format.sh
```

## Testing

To run the backend tests, you can use `pytest`. Run these commands:

```bash
cd server
pytest
```

## Demo

You can view a demo video on YouTube using this link:

<https://www.youtube.com/watch?v=JMaAIcA0ELw>

## License

This project is licensed under the MIT License.

```plaintext
 The MIT License (MIT)

Copyright © 2025 Denis Topallaj

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
