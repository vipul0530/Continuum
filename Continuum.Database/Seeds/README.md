# Continuum.Database

EF Core migrations and schema management for Continuum.

## Getting Started

From the solution root, run EF Core migrations using the API project as the startup project:

```bash
dotnet ef migrations add InitialCreate \
  --project Continuum.Database \
  --startup-project Continuum.API \
  --context ApplicationDbContext

dotnet ef database update \
  --project Continuum.Database \
  --startup-project Continuum.API \
  --context ApplicationDbContext
```

## Seeded Counties

The `ApplicationDbContext.OnModelCreating` seeds these California counties by default:

| ID | County        | FIPS  |
|----|---------------|-------|
| 1  | San Diego     | 06073 |
| 2  | Riverside     | 06065 |
| 3  | San Bernardino| 06071 |
| 4  | Fresno        | 06019 |
