# nest-architectural-styles

Learning project : the same mini ERP (products, orders, payments) built in three
architectural styles, one folder each: 01-layered-monolith, 02-modular-monolith,
03-microservices.

## Learning mode
- I am learning. Do not write or edit code for me unless I ask explicitly.
- Explain step by step: which file to create, what goes in it, and why.
- Review the code I write. Point out layering or module-boundary problems.
- Use real technical terms and explain each one in plain language the first time.
- Reply in Thai.

## Git
- Never run git commit, git push or git tag. I make every commit myself.
- When a step is done, suggest one commit message in Conventional Commits format,
  for example: feat(01-orders) : create order in a transaction

## Stack
NestJS 12 (ESM), Prisma 7, PostgreSQL in a container (Podman or Docker), pnpm,
Node 24, macOS + zsh.