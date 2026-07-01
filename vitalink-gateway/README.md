# VitaLink Gateway

API Gateway NestJS 11+ pour la plateforme Assurance-Hôpital.

## Architecture

- **7 modules** : Auth, Claims, Eligibility, Notifications, Audit, Monitoring, Health
- **RBAC complet** : `scope:hospital`, `scope:insurance`, `scope:admin`, `scope:auditor` via `APP_GUARD` global
- **Event-driven** : RabbitMQ avec exchanges topic, queues durable, retry avec dead-letter
- **JWT** : Access token (15min) + Refresh token (7j) avec rotation et blacklist MongoDB
- **Sécurité** : bcrypt pour refresh tokens, helmet, CORS, rate limiting, validation pipe OWASP

## Infra

- **MongoDB** : 6 schemas (Claims, Notifications, AuditLogs, TokenBlacklist, RefreshToken, EligibilityCheck)
- **Docker Compose** : Gateway + MongoDB + Redis + RabbitMQ + Prometheus + Grafana + Jaeger
- **Swagger/OpenAPI** : Documentation complète auto-générée sur `/docs`
- **GitHub Actions CI/CD** : Lint → Unit Tests → E2E Tests → Docker Build → Security Audit
- **Tests** : 10 tests unitaires (Auth + Claims) + 2 suites E2E

## Endpoints

| Endpoint | Méthode | Scope |
| :--- | :--- | :--- |
| `/auth/login` | POST | Public |
| `/auth/refresh` | POST | Public |
| `/auth/me` | GET | Auth |
| `/claims` | GET/POST | hospital/insurance/admin |
| `/claims/:id` | GET | hospital/insurance/admin |
| `/claims/:id/approve` | PUT | insurance |
| `/claims/:id/reject` | PUT | insurance |
| `/claims/:id/dispute` | PUT | hospital/insurance |
| `/eligibility/:patientId` | GET | hospital |
| `/audit` | GET | admin/auditor |
| `/notifications` | GET/POST | Auth |
| `/health` | GET | Public |
