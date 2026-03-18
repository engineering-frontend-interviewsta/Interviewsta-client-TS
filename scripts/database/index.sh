#!/usr/local/bin/bash 

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ROOT_DIR="/Users/arryuannkhanna/interviewsta-backend"
ENV_FILE="$ROOT_DIR/.env"

# Colors
GREEN="\033[32m"
RED="\033[31m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

if [[ ! -f "$ENV_FILE" ]]; then
    echo -e "${RED}Error: .env file not found at $ENV_FILE${RESET}"
    return 1 2>/dev/null || exit 1
fi

get_env_val() {
    grep "^$1=" "$ENV_FILE" | cut -d '=' -f2- | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//" | tr -d '\r'
}

DB_NAME=$(get_env_val "DB_NAME")
DB_USERNAME=$(get_env_val "DB_USERNAME")
DB_PASSWORD=$(get_env_val "DB_PASSWORD")
DB_HOST=$(get_env_val "DB_HOST")
DB_PORT=$(get_env_val "DB_PORT")

print_success() { echo -e "${GREEN}✔ $1${RESET}"; }
print_error()   { echo -e "${RED}✘ $1${RESET}"; }
print_info()    { echo -e "${BLUE}ℹ $1${RESET}"; }


get_db_name()     { echo "$DB_NAME"; }
get_db_username() { echo "$DB_USERNAME"; }
get_db_host()     { echo "$DB_HOST"; }
get_db_port()     { echo "$DB_PORT"; }

get_db_password() { echo "$DB_PASSWORD"; }