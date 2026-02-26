# SahyadriPrep Technical Standards
- Pattern: Repository -> Service -> Orchestrator -> API -> Hook.
- Database: Refer to the provided SQL schema with polymorphic learning_resources.
- Error Handling: Always use 'handleSupabaseResult' for DB queries.
- API Formatting: Use 'withApiHandler' for server responses; 'toCamelCase' is mandatory.
- Folder Structure:
  - Repositories: src/lib/repositories/[feature]
  - Services: src/lib/services/[feature]
  - API Routes: src/app/api/[feature]/route.ts
  - Hooks: src/hooks/use[Feature].hook.ts