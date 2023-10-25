# Use python:3.10.12-slim as the base image
FROM python:3.10.12-slim

COPY dist/*.whl /packages/

# Set environment variables for the container
ARG ENV
ENV ENV=$ENV
ENV ARGILLA_HOME_PATH=/var/lib/argilla
ENV DEFAULT_USER_ENABLED=true
ENV DEFAULT_USER_PASSWORD=1234
ENV DEFAULT_USER_API_KEY=argilla.apikey
ENV USERS_DB=/config/.users.yml
ENV UVICORN_PORT=6900

# Create a user and a volume for argilla
RUN useradd -ms /bin/bash argilla
RUN mkdir -p "$ARGILLA_HOME_PATH" && \
  chown argilla:argilla "$ARGILLA_HOME_PATH" && \
  apt-get update && \
  apt-get install -y python-dev-is-python3 libpq-dev gcc && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Set up a virtual environment in /opt/venv
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy the scripts and install uvicorn
COPY docker/scripts/start_argilla_server.sh /home/argilla/
RUN chmod +x /home/argilla/start_argilla_server.sh && \
  pip install uvicorn[standard] && \
  for wheel in /packages/*.whl; do pip install "$wheel"[server,postgresql]; done && \
  rm -rf /packages

# Switch to the argilla user
USER argilla

# Set the working directory
WORKDIR /home/argilla/

# Copy the entire repository into /home/argilla in the container
COPY . /home/argilla/

# Expose the necessary port
EXPOSE 6900

# Set the command for the container
CMD /bin/bash -c "ls -al *; pip install --upgrade -e .; /bin/bash start_argilla_server.sh"
