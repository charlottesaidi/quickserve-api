#!/bin/bash
# Ce script exécute le linter sur tous les services

# Liste des services
SERVICES=("api-gateway" "users-service" "geolocation-service" "services-service" "payment-service")

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Fonction pour exécuter le linter sur un service
run_lint() {
  local service=$1
  local fix=$2
  
  echo -e "${YELLOW}Linting $service...${NC}"
  
  # Se déplacer dans le répertoire du service
  cd "$service" || return 1
  
  # Exécuter le linter avec ou sans --fix
  if [ "$fix" = true ]; then
    npm run lint:fix
  else
    npm run lint
  fi
  
  local result=$?
  
  # Retourner au répertoire parent
  cd ..
  
  # Afficher le résultat
  if [ $result -eq 0 ]; then
    echo -e "${GREEN}✓ $service passed linting${NC}"
  else
    echo -e "${RED}✗ $service failed linting${NC}"
    return 1
  fi
  
  return 0
}

# Vérifier si l'option --fix est passée
FIX=false
if [ "$1" = "--fix" ]; then
  FIX=true
  echo -e "${YELLOW}Running linter with auto-fix enabled${NC}"
fi

# Variables pour suivre les résultats
FAILED_SERVICES=()
SUCCESS=true

# Exécuter le linter sur chaque service
for service in "${SERVICES[@]}"
do
  if run_lint "$service" $FIX; then
    # Le linting a réussi
    :
  else
    # Le linting a échoué
    FAILED_SERVICES+=("$service")
    SUCCESS=false
  fi
  
  echo "----------------------------------------"
done

# Afficher un résumé
echo ""
echo "Lint Summary:"
echo "----------------------------------------"

if [ ${#FAILED_SERVICES[@]} -eq 0 ]; then
  echo -e "${GREEN}All services passed linting${NC}"
else
  echo -e "${RED}The following services failed linting:${NC}"
  for service in "${FAILED_SERVICES[@]}"
  do
    echo -e "${RED}- $service${NC}"
  done
  echo ""
  echo -e "${YELLOW}You can run './lint-all.sh --fix' to automatically fix some issues${NC}"
  exit 1
fi