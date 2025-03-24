FROM python:3.12-slim

RUN apt-get update && apt-get install -y \
    wkhtmltopdf \
    && apt-get clean \

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && apt-get install -y make

# Download and install uv
RUN curl -fsSL https://astral.sh/uv/install.sh | sh

ENV PATH="/root/.local/bin:$PATH"

COPY pyproject.toml uv.lock ./

# Install dependencies using uv
RUN uv venv create --system-site-packages && uv pip install --system -r pyproject.toml

COPY . .

EXPOSE 8040

CMD ["uv", "run", "python", "main.py"]