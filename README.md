## Fitness Microservices Project

A microservices-based fitness application with Spring Boot services, API Gateway, service discovery, centralized configuration, and a Vite + React frontend.

### Architecture

- **Service Discovery**: `eureka` (Netflix Eureka)
- **Configuration**: `configserver` (Spring Cloud Config; native filesystem backend)
- **API Gateway**: `gateway` (Spring Cloud Gateway)
- **Domain Services**:
  - `userservice` (PostgreSQL, JPA)
  - `activityservice` (MongoDB, RabbitMQ)
  - `aiservice` (MongoDB, RabbitMQ, external Gemini API)
- **Frontend**: `frontend` (Vite + React)

### Default Ports

- Eureka: `8761`
- Config Server: `8888`
- API Gateway: `8080`
- User Service: `8081`
- Activity Service: `8082`
- AI Service: `8083`
- Frontend (Vite dev): `5173`

### Routing (via API Gateway)

- `lb://USERSERVICE` → `GET/POST/PUT/DELETE /api/users/**`
- `lb://ACTIVITY-SERVICE` → `GET/POST/PUT/DELETE /api/activities/**`
- `lb://AI-SERVICE` → `GET /api/recommendations/**`

The Gateway is configured as a JWT resource server. The JWK set URI points at `http://localhost:8181/realms/fitness-oauth2/protocol/openid-connect/certs` (e.g., Keycloak). If you do not run an IdP locally, disable security or provide a valid JWT for protected endpoints.

### Prerequisites

- Java 17+
- Maven (wrapper provided: `mvnw`)
- Node.js 18+ and npm (for frontend)
- PostgreSQL running locally with database `fitness_user_db`
  - Default creds: `postgres` / `password`
- MongoDB running locally with databases `fitnessactivity` and `fitnessrecommendation`
- RabbitMQ running locally (default `guest` / `guest` on `localhost:5672`)
- Optional: Keycloak on `localhost:8181` with realm `fitness-oauth2` (or adjust the Gateway JWK URI)

### Configuration

- Centralized service configs live in `configserver/src/main/resources/config/`:
  - `api-gateway.yml`
  - `activity-service.yml`
  - `ai-service.yml`
- Local `application.yml` files in each service reference the Config Server and define service-specific settings (ports, DBs, RabbitMQ, Eureka, etc.).
- AI Service requires a Gemini API key:
  - Set in `aiservice/src/main/resources/application.yml` under `gemini.api.key` (or externalize via env vars / config server).

### Running the Stack (Local)

1) Start infrastructure dependencies

- PostgreSQL (ensure DB `fitness_user_db` exists and credentials match)
- MongoDB (no auth required by default; databases will be created on first use)
- RabbitMQ (default local install)
- Optional: IdP (Keycloak) if you want JWT auth enabled end-to-end

2) Start core platform services (use separate terminals)

```bash
cd /workspace/eureka && ./mvnw spring-boot:run
cd /workspace/configserver && ./mvnw spring-boot:run
```

3) Start domain services

```bash
cd /workspace/userservice && ./mvnw spring-boot:run
cd /workspace/activityservice && ./mvnw spring-boot:run
cd /workspace/aiservice && ./mvnw spring-boot:run
```

4) Start API Gateway

```bash
cd /workspace/gateway && ./mvnw spring-boot:run
```

5) Start Frontend (Dev)

```bash
cd /workspace/frontend/frontend && npm install && npm run dev
```

### Helpful URLs

- Eureka Dashboard: `http://localhost:8761`
- API Gateway Base URL: `http://localhost:8080`
- Frontend (Vite): `http://localhost:5173`

### Example Requests (through Gateway)

```bash
# List users
curl -s http://localhost:8080/api/users | jq

# Create an activity (example JSON)
curl -s -X POST http://localhost:8080/api/activities \
  -H "Content-Type: application/json" \
  -d '{"userId":"123","type":"RUN","duration":1800,"distance":5.0}' | jq

# Get AI recommendations
curl -s "http://localhost:8080/api/recommendations?userId=123" | jq
```

Note: If JWT auth is enforced, include an `Authorization: Bearer <token>` header.

### Development Notes

- Use `./mvnw clean verify` in each backend module to build.
- The Gateway, services, and discovery rely on service names in Eureka (`USERSERVICE`, `ACTIVITY-SERVICE`, `AI-SERVICE`). Ensure each service registers successfully (check Eureka UI).
- Update databases, RabbitMQ, and JWT settings as needed in `application.yml` or Config Server files.

### Frontend

- The frontend lives in `/workspace/frontend/frontend`. See its local `README.md` for more details.

### Troubleshooting

- 401/403 at Gateway: supply a valid JWT or disable resource server security for local testing.
- Service not reachable: confirm Eureka registration and that the service port matches the config.
- DB connection errors: verify Postgres and MongoDB are running and credentials match.
- RabbitMQ issues: ensure the broker is running on `localhost:5672` with `guest/guest`.

