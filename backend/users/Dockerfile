FROM python:3.12-slim

WORKDIR /app

# The installer requires curl (and certificates) to download the release archive
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && apt-get install -y make

# Download and install uv
RUN curl -fsSL https://astral.sh/uv/install.sh | sh

ENV PATH="/root/.local/bin:$PATH"

COPY pyproject.toml uv.lock ./

# Install dependencies using uv
RUN uv venv create --system-site-packages && uv pip install --system -r pyproject.toml

COPY . .

EXPOSE 8030

CMD ["uv", "run", "python", "main.py"]