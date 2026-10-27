# Mini ERP แผนเริ่มต้น 01 Layered Monolith

Oct 27, 2026 · @New

## ภาพรวม

เป้าหมายของเอกสารนี้คือพาไปถึง **01-layered-monolith ที่รันได้จริง** บนเครื่องตัวเอง แล้วติด tag `v0-layered` ก่อนไปทำ 02 และ 03

repo เดียวมี 3 โฟลเดอร์ แต่ละโฟลเดอร์เป็น project อิสระที่รันได้เอง และใช้ business เดียวกัน (products, orders, payments) จะได้เทียบกันได้ตรง ๆ

```
nest-architectural-styles/
├── README.md                 ← อธิบายแต่ละโฟลเดอร์ และต่างกันตรงไหน
├── CLAUDE.md                 ← บอก Claude Code ว่าเป็นโหมดเรียนรู้
├── docs/
│   └── adr/                  ← บันทึกการตัดสินใจ
├── 01-layered-monolith/      ← เอกสารนี้
├── 02-modular-monolith/      ← ทำทีหลัง (Nx)
└── 03-microservices/         ← ทำทีหลัง (Nx)
```

**วิธีใช้เอกสารนี้กับ Claude Code**

1. ทำตามทีละขั้น พิมพ์คำสั่งเอง และเขียนโค้ดเอง
2. ติดตรงไหนให้ถาม Claude Code โดยวาง error ทั้งข้อความ หรือบอกเลขขั้นในเอกสารนี้
3. เขียนเสร็จแต่ละขั้น ให้ Claude Code รีวิว แล้วค่อย commit

ทุกคำสั่งในเอกสารนี้พิมพ์ใน **Terminal** บน macOS (zsh)

## ขั้นที่ 0 - ติดตั้งเครื่องมือ (macOS)

ติดตั้งทุกอย่างผ่าน **Homebrew** (ตัวติดตั้งโปรแกรมที่นิยมที่สุดบน macOS) แล้วปิด Terminal เปิดใหม่ก่อนตรวจสอบ

| เครื่องมือ | ใช้ทำอะไร |
| --- | --- |
| **Homebrew** | ติดตั้งโปรแกรมอื่นทั้งหมด |
| **Git** + SSH key | เก็บประวัติโค้ด และ clone/push กับ GitHub |
| **fnm** (Fast Node Manager) | ติดตั้งและสลับเวอร์ชัน Node.js ตาม project ได้ |
| **Node.js 24 LTS** | รัน JavaScript/TypeScript ฝั่ง server |
| **pnpm** | ติดตั้ง package: เร็ว, ประหยัดดิสก์, กัน phantom dependency และมี workspace สำหรับ monorepo |
| **Podman Desktop** | รัน PostgreSQL ใน container (ใช้ Docker ที่มีอยู่แทนได้ ดูขั้นที่ 2.2) |
| **VS Code** | เขียนโค้ด |
| **Claude Code** | ผู้ช่วยอธิบายและรีวิวโค้ดใน repo |

```bash
# 1) Homebrew (ข้ามได้ถ้า brew --version มีเวอร์ชันขึ้นแล้ว)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2) เครื่องมือหลัก
brew install git fnm pnpm
brew install --cask podman-desktop visual-studio-code

# 3) Node.js 24 ผ่าน fnm
echo 'eval "$(fnm env --use-on-cd --shell zsh)"' >> ~/.zshrc
source ~/.zshrc
fnm install 24
fnm default 24

# 4) Claude Code
curl -fsSL https://claude.ai/install.sh | bash
```

**หมายเหตุ**

- **Homebrew**: ติดตั้งเสร็จจะมีหัวข้อ **Next steps** ให้ copy คำสั่งที่ขึ้นมาไปรันต่อ (เพิ่ม brew เข้า PATH บน Mac ชิป Apple)
- **Node.js**: ใช้ 24 (LTS) ส่วน 26 จะเป็น Active LTS วันที่ 28 ต.ค. 2026 ใช้ได้ทั้งคู่ เพราะ NestJS 12 ต้องการ Node 20.19+ หรือ 22.12+ ส่วน `--use-on-cd` ทำให้ fnm สลับเวอร์ชันเองเมื่อ `cd` เข้าโฟลเดอร์ที่มีไฟล์ `.node-version`
- **Podman Desktop**: เปิดครั้งแรกจะมีหน้า setup ให้กดติดตั้ง **Podman** กับ **Compose** และสร้าง **Podman machine** (VM เล็ก ๆ ที่ใช้รัน container บน macOS) ถ้าตัดสินใจใช้ Docker ไปก่อน ข้ามตัวนี้ได้
- **Claude Code**: ต้องใช้บัญชี Pro, Max, Team หรือ Enterprise พิมพ์ `claude` ครั้งแรกจะเปิดเบราว์เซอร์ให้ login
- **VS Code extension** ที่ควรลง: **Prisma** (สีและตรวจ syntax ในไฟล์ schema)

**มี Node เวอร์ชันอื่นที่ project อื่นใช้อยู่แล้ว** ให้ตั้งเวอร์ชันนั้นเป็นค่าเริ่มต้นแทน แล้วใช้ Node 24 เฉพาะใน repo นี้ผ่านไฟล์ `.node-version` project อื่นจะไม่ได้รับผลกระทบ

```bash
node --version        # จดเวอร์ชันที่ใช้อยู่ เช่น v22.14.0
fnm install 22        # เลข major ตามที่จดได้
fnm default 22        # ทุก project ใช้เวอร์ชันนี้เหมือนเดิม
fnm install 24        # ไว้ใช้เฉพาะ repo นี้
```

**ตั้งค่า Git และตรวจ SSH key** (ใช้อีเมลของบัญชี GitHub ส่วนตัว)

```bash
git config --global user.name "ชื่อของคุณ"
git config --global user.email "อีเมล GitHub ส่วนตัว"
git config --global init.defaultBranch main
ssh -T git@github.com    # ต้องขึ้น Hi <ชื่อบัญชีส่วนตัว>!
```

**ตรวจสอบ** ทุกคำสั่งต้องพิมพ์เลขเวอร์ชันออกมา ไม่ใช่ error

```bash
brew --version
git --version
node --version
pnpm --version
podman --version
claude --version
```

- [ ] ทุกคำสั่งข้างบนแสดงเวอร์ชัน และ `fnm list` มี 24
- [ ] `podman machine list` ขึ้น Running (หรือ Docker Desktop เปิดอยู่ ถ้าใช้ Docker)
- [ ] `ssh -T git@github.com` ขึ้นชื่อบัญชี GitHub ส่วนตัว

## ขั้นที่ 1 - สร้าง repo nest-architectural-styles

สร้าง repo บน GitHub ส่วนตัว แล้ววางไฟล์ระดับ root ให้ครบก่อนเริ่มเขียนโค้ด **ห้าม copy โค้ดจาก sunmith-data-center มาใส่** ให้เขียนใหม่ทั้งหมด

สร้าง repo บนเว็บ แล้ว clone ผ่าน SSH

**สร้างบนเว็บ** ที่ github.com/new: ตั้งชื่อ `nest-architectural-styles`, เลือก **Public (หรือ Private)**, ติ๊ก **Add README**, เลือก **.gitignore template: Node** แล้ว clone ลงเครื่อง

```bash
mkdir -p ~/dev && cd ~/dev
git clone git@github.com:<ชื่อบัญชี GitHub>/nest-architectural-styles.git
cd nest-architectural-styles
git remote -v    # ต้องขึ้นต้นด้วย git@github.com:
```

จากนั้นสร้างโฟลเดอร์และกำหนดเวอร์ชัน Node ของ repo

```bash
mkdir -p docs/adr .claude
echo "24" > .node-version
code .
```

- template **Node** ใส่ `.gitignore` มาตรฐานให้ (มี `node_modules/`, `dist/`, `.env` อยู่แล้ว)
- `.node-version` บอก fnm ว่า repo นี้ใช้ Node 24 ใคร clone ไปก็ได้เวอร์ชันเดียวกัน
- `code .` เปิดโฟลเดอร์นี้ใน VS Code

**สร้าง 4 ไฟล์ใน VS Code**

1. **`CLAUDE.md`** - บอก Claude Code ว่าอยู่ในโหมดเรียนรู้ ทุกครั้งที่เปิด `claude` ใน repo นี้จะอ่านไฟล์นี้เอง
2. **`README.md`** - แก้จากที่ GitHub สร้างให้ อธิบาย 3 โฟลเดอร์
3. **`docs/adr/0001-one-folder-per-architecture-style.md`** - ADR ฉบับแรก
4. **`.claude/settings.json`** - บังคับไม่ให้ Claude Code commit, push หรือใส่ชื่อ Claude ใน commit

`CLAUDE.md`

```markdown
# nest-architectural-styles

Learning project: the same mini ERP (products, orders, payments) built in three
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
  for example: feat(01-orders): create order in a transaction
- Never add Co-Authored-By, "Generated with Claude Code" or any Claude attribution
  to commit messages, PR descriptions or contributors.

## Stack
NestJS 12 (ESM), Prisma 7, PostgreSQL in a container (Podman or Docker), pnpm,
Node 24, macOS + zsh.
```

`README.md`

```markdown
# nest-architectural-styles

Mini ERP เดียวกัน ทำ 3 Architectural Styles เพื่อเทียบกัน

| โฟลเดอร์ | Style | Deployment | Partitioning |
| --- | --- | --- | --- |
| 01-layered-monolith | Layered Monolith | 1 process | Technical (by layer) |
| 02-modular-monolith | Modular Monolith | 1 process | Domain (by feature) |
| 03-microservices | Microservices | N processes | Domain + DB per service |
```

`docs/adr/0001-one-folder-per-architecture-style.md`

```markdown
# ADR-0001: แยกแต่ละ Architecture Style เป็นโฟลเดอร์

- Status: Accepted
- Date: 2026-10-27

## Context
ต้องการเปิดดูโค้ดทุก style เทียบกันได้ทันที โดยไม่ต้องสลับ branch

## Decision
1 โฟลเดอร์ต่อ 1 style ทำตามลำดับ 01 → 02 → 03
แต่ละโฟลเดอร์เริ่มจากการ copy โฟลเดอร์ก่อนหน้า แล้ว refactor ต่อ
ติด git tag เมื่อแต่ละ style เสร็จ (v0-layered, v1-modular, v2-microservices)

## Consequences
- ดี: เทียบกันได้ด้วย git diff --no-index
- เสีย: โค้ดบางส่วนซ้ำกันข้ามโฟลเดอร์
```

`.claude/settings.json` - ไฟล์ตั้งค่าของ Claude Code ที่ commit ได้

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "attribution": { "commit": "", "pr": "" },
  "permissions": {
    "deny": ["Bash(git commit *)", "Bash(git push *)", "Bash(git tag *)"]
  }
}
```

- `CLAUDE.md` เป็น **คำสั่ง** ที่ Claude ทำตาม ส่วน `settings.json` เป็น **การบังคับ** ถึง Claude จะลืม คำสั่งที่อยู่ใน `deny` ก็รันไม่ได้
- `attribution` เป็นค่าว่าง = ไม่ใส่ Co-Authored-By หรือบรรทัด "Generated with Claude Code" ใน commit และ PR
- ส่วนแต่ละขั้นในเอกสารนี้ที่เขียนว่า "commit:" คือ commit message ที่แนะนำ คุณพิมพ์คำสั่ง git เอง

**Commit แรก** ใช้รูปแบบ **Conventional Commits** (ขึ้นต้นด้วยประเภทงาน เช่น `feat:` `fix:` `chore:` `docs:`)

```bash
git add .
git commit -m "chore: set up repo structure, CLAUDE.md, Claude settings and ADR-0001"
git push
```

- [ ] เปิด repo บน GitHub แล้วเห็น `CLAUDE.md`, `README.md` และ `docs/adr/`

## ขั้นที่ 2 - สร้าง 01-layered-monolith

จบขั้นนี้จะได้ NestJS ที่ต่อ PostgreSQL ผ่าน Prisma ได้ ยังไม่มี business logic

### 2.1 สร้าง NestJS project

รันที่ root ของ `nest-architectural-styles`

```bash
pnpm dlx @nestjs/cli new 01-layered-monolith --package-manager pnpm --skip-git
cd 01-layered-monolith
pnpm start:dev
```

- `pnpm dlx` รัน NestJS CLI ครั้งเดียวโดยไม่ต้องติดตั้งลงเครื่อง หลังจากนี้ใช้ `pnpm nest ...` ใน project แทน
- `--skip-git` สำคัญ: ถ้าไม่ใส่ CLI จะสร้าง git repo ซ้อนอยู่ข้างใน `nest-architectural-styles`
- ตอน CLI ถามว่าจะใช้ **CommonJS หรือ ESM** ให้เลือก **ESM** (รูปแบบ module มาตรฐานของ JavaScript ที่ NestJS 12 และ Prisma 7 ใช้เป็นค่าเริ่มต้น) จะได้ Vitest สำหรับ test และ oxlint สำหรับ lint
- กฎของ ESM: import ไฟล์ใน project ต้องลงท้ายด้วย `.js` เช่น `./app.service.js` ถึงไฟล์จริงจะเป็น `.ts` ให้ทำตามรูปแบบไฟล์ที่ CLI สร้างให้

เปิด http://localhost:3000 ต้องเห็น `Hello World!` แล้วกด `Ctrl + C` เพื่อหยุด

### 2.2 รัน PostgreSQL ใน Podman

สร้างไฟล์ `compose.yaml` ใน `01-layered-monolith/`

```yaml
services:
  postgres:
    image: docker.io/library/postgres:18
    environment:
      POSTGRES_USER: erp
      POSTGRES_PASSWORD: erp_dev_password
      POSTGRES_DB: mini_erp_layered
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql

volumes:
  pgdata:
```

```bash
# Podman
podman compose up -d
podman ps

# หรือ Docker (compose.yaml ไฟล์เดียวกัน)
docker compose up -d
docker ps
```

- `podman ps` ต้องเห็น container postgres สถานะ `Up`
- **volume** (`pgdata`) คือที่เก็บข้อมูลนอก container ปิดแล้วเปิดใหม่ข้อมูลไม่หาย
- รหัสผ่านนี้ใช้บนเครื่องตัวเองเท่านั้น ห้ามใช้บน server จริง

**Podman หรือ Docker** ใช้ตัวไหนก็ได้ เพราะอ่าน `compose.yaml` และ image ชุดเดียวกัน ต่างกันแค่ชื่อคำสั่ง อย่าเปิด Docker Desktop กับ Podman machine พร้อมกัน เพราะจะแย่ง port 5432 กัน

### 2.3 ติดตั้งและตั้งค่า Prisma 7

```bash
pnpm add -D prisma@7 dotenv
pnpm add @prisma/client@7 @prisma/adapter-pg pg @nestjs/config
pnpm prisma init --output ../src/generated/prisma
```

- ระบุ `@7` เสมอ เพราะ tag `latest` อาจชี้ไปที่ Prisma 8 รุ่นทดลอง และ `prisma` กับ `@prisma/client` ต้องเป็น major version เดียวกัน
- **Driver adapter** (`@prisma/adapter-pg` + `pg`) คือตัวเชื่อม Prisma กับ PostgreSQL ซึ่ง Prisma 7 บังคับใช้
- `prisma init` สร้าง `prisma/schema.prisma`, `prisma.config.ts` และ `.env`

แก้ `.env` ให้ตรงกับ `compose.yaml` แล้วสร้าง `.env.example` เนื้อหาเดียวกัน

```
DATABASE_URL="postgresql://erp:erp_dev_password@localhost:5432/mini_erp_layered?schema=public"
```

- `.env` ห้าม commit (มีใน `.gitignore` แล้ว) ส่วน `.env.example` commit ได้ คนอื่นจะรู้ว่าต้องตั้งค่าอะไรบ้าง
- เพิ่ม `src/generated/` ลง `.gitignore` เพราะเป็นไฟล์ที่ `prisma generate` สร้างใหม่ได้ทุกเมื่อ

ตรวจ `prisma/schema.prisma` ส่วนบนสุดต้องเป็นแบบนี้

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

### 2.4 PrismaService

ไฟล์เชื่อมต่อฐานข้อมูลที่ทุก repository จะใช้ สร้าง `src/database/prisma.service.ts`

```ts
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService) {
    super({
      adapter: new PrismaPg({ connectionString: config.getOrThrow<string>('DATABASE_URL') }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

จากนั้นสร้าง `src/database/prisma.module.ts` ให้ `providers` และ `exports` เป็น `PrismaService` และใส่ `@Global()` แล้วใน `app.module.ts` ให้ import `ConfigModule.forRoot({ isGlobal: true })` กับ `PrismaModule`

- [ ] `pnpm start:dev` รันได้โดยไม่มี error เรื่องต่อฐานข้อมูลไม่ได้
- [ ] commit: `chore(01): scaffold NestJS, PostgreSQL and Prisma`

## ขั้นที่ 3 - โครงสร้าง Layered และ Milestone

จบขั้นนี้จะได้ API ที่สร้างสินค้า สั่งซื้อ และชำระเงินได้ โดยทุกอย่างที่เกี่ยวกับเงินและสต็อกอยู่ใน **transaction** (กลุ่มคำสั่งที่สำเร็จทั้งหมด หรือยกเลิกทั้งหมด)

### 3.1 โครงสร้างโฟลเดอร์

แบ่งตาม **layer** (ชั้นเทคนิค) ทุก controller อยู่รวมกัน ทุก service อยู่รวมกัน และลงทะเบียนทุกอย่างใน `AppModule` ตัวเดียว

```
01-layered-monolith/
├── src/
│   ├── main.ts
│   ├── app.module.ts                ← ลงทะเบียนทุก controller, service, repository
│   ├── controllers/
│   │   ├── products.controller.ts
│   │   ├── orders.controller.ts
│   │   └── payments.controller.ts
│   ├── services/
│   │   ├── products.service.ts
│   │   ├── orders.service.ts
│   │   └── payments.service.ts
│   ├── repositories/
│   │   ├── products.repository.ts
│   │   ├── orders.repository.ts
│   │   └── payments.repository.ts
│   ├── dto/                         ← รูปแบบข้อมูลที่รับเข้ามา
│   ├── common/
│   │   └── filters/                 ← แปลง error ให้เป็นรูปแบบเดียวกัน
│   ├── database/                    ← PrismaService, PrismaModule
│   └── generated/prisma/            ← สร้างโดย prisma generate (ไม่ commit)
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── test/                            ← e2e test
├── compose.yaml
├── prisma.config.ts
├── .env.example
└── package.json
```

**หน้าที่ของแต่ละ layer**

| Layer | ทำ | ห้ามทำ |
| --- | --- | --- |
| **Controller** | รับ request, ตรวจ DTO, เรียก service, ส่ง response | เขียน business logic หรือเรียก Prisma ตรง ๆ |
| **Service** | business logic เช่น สต็อกพอไหม คำนวณยอด เปิด transaction | รู้จัก HTTP (request, status code) |
| **Repository** | อ่านเขียนฐานข้อมูลผ่าน Prisma | ตัดสินใจเรื่องธุรกิจ |

### 3.2 Milestone

ทำตามลำดับ แต่ละข้อจบด้วย commit 1 ครั้ง

1. **M1 - Schema และ Seed**
   - เขียน model ใน `schema.prisma` ตามตารางด้านล่างด้วยตัวเอง
   - `pnpm prisma migrate dev --name init` แล้ว `pnpm prisma generate`
   - เขียน `prisma/seed.ts` ใส่สินค้าตัวอย่าง 3–5 รายการ
   - เสร็จเมื่อ: `pnpm prisma studio` เปิดดูแล้วเห็นสินค้าที่ seed
2. **M2 - Products CRUD**
   - `POST /products`, `GET /products`, `GET /products/:id`, `PATCH /products/:id`
   - DTO + class-validator, controller → service → repository
   - เสร็จเมื่อ: ส่ง `price` ติดลบแล้วได้ 400, หา id ที่ไม่มีแล้วได้ 404, SKU ซ้ำแล้วได้ 409
3. **M3 - สร้างคำสั่งซื้อ (มี transaction)**
   - `POST /orders` รับรายการ `{ productId, quantity }`
   - ใน transaction เดียว: ตัดสต็อกทุกรายการ → สร้าง Order + OrderItem → คำนวณ total
   - สต็อกไม่พอแม้รายการเดียว = ยกเลิกทั้งหมด (**rollback**) แล้วตอบ 409
   - เสร็จเมื่อ: สั่งเกินสต็อกแล้วสต็อกของทุกสินค้าเท่าเดิม และไม่มี Order ค้างในฐานข้อมูล
4. **M4 - ชำระเงิน (มี transaction)**
   - `POST /orders/:id/payments`
   - ใน transaction เดียว: สร้าง Payment → เปลี่ยน Order เป็น `PAID`
   - เสร็จเมื่อ: จ่ายซ้ำได้ 409, ยอดไม่ตรงกับ total ได้ 400

**Model ที่ต้องมี** (เขียน schema เอง แล้วให้ Claude Code รีวิว)

| Model | Field หลัก | หมายเหตุ |
| --- | --- | --- |
| **Product** | id, sku (unique), name, price, stock, createdAt, updatedAt | stock เป็นจำนวนเต็ม ห้ามติดลบ |
| **Order** | id, status, total, createdAt, updatedAt | status เป็น enum: `PENDING`, `PAID`, `CANCELLED` |
| **OrderItem** | id, orderId, productId, quantity, unitPrice | เก็บราคา ณ ตอนสั่ง เพราะราคาสินค้าเปลี่ยนทีหลังได้ |
| **Payment** | id, orderId, amount, paidAt | 1 order มีได้ 1 payment |

เงินทุก field (`price`, `total`, `unitPrice`, `amount`) ใช้ `Decimal @db.Decimal(12, 2)` **ห้ามใช้ Float** เพราะ Float ปัดเศษผิด (เช่น 0.1 + 0.2 ได้ 0.30000000000000004)

### 3.3 Prisma Transaction กับ Repository

Service เป็นคนเปิด transaction แล้วส่ง `tx` (transaction client) ให้ทุก repository ที่ใช้ในงานนั้น ทุกคำสั่งจะอยู่ใน transaction เดียวกัน

```ts
// services/orders.service.ts (โครงเท่านั้น เติมรายละเอียดเอง)
return this.prisma.$transaction(async (tx) => {
  for (const item of dto.items) {
    await this.productsRepository.decrementStock(item.productId, item.quantity, tx);
  }
  return this.ordersRepository.create({ /* ... */ }, tx);
});
```

```ts
// repositories/products.repository.ts
async decrementStock(id: string, quantity: number, tx: Prisma.TransactionClient = this.prisma) {
  const result = await tx.product.updateMany({
    where: { id, stock: { gte: quantity } },
    data: { stock: { decrement: quantity } },
  });
  if (result.count === 0) throw new InsufficientStockError(id);
}
```

- **ทำไมใช้ `updateMany` + `stock: { gte: quantity }`**: เช็กสต็อกกับตัดสต็อกเกิดในคำสั่งเดียว ถ้าแยกเป็น "อ่านก่อนแล้วค่อยแก้" สองคนที่สั่งพร้อมกันจะเห็นว่าสต็อกพอทั้งคู่ และสต็อกจะติดลบ (ปัญหานี้เรียกว่า **race condition**)
- throw error ใน callback = Prisma **rollback** ทุกคำสั่งใน transaction ให้อัตโนมัติ
- `Prisma` import จาก `../generated/prisma/client.js` ส่วน `InsufficientStockError` เป็น error class ที่เขียนเอง แล้วให้ exception filter แปลงเป็น 409

&#91;embedded content: flow ของ POST /orders · 1 transaction, 2 ทางจบ\]

ถ้ารายการใดสต็อกไม่พอ repository จะ throw error ทำให้ Prisma ยกเลิกทุกคำสั่งที่ทำไปแล้วใน transaction นั้น รวมถึงสต็อกของรายการก่อนหน้าที่ตัดไปแล้ว

**สิ่งที่ต้องสังเกตใน M3:** `OrdersService` เรียก `ProductsRepository` ตรงๆ ใน Layered ไม่มีอะไรห้ามเรื่องนี้ ตรงนี้คือจุดที่ 02-modular-monolith จะเปลี่ยน

## ขั้นที่ 4 - Best Practices และ Checklist

ใส่ 5 เรื่องนี้ให้ครบก่อนติด tag ทุกเรื่องจะติดตัวไปใช้ต่อใน 02 และ 03 ด้วย

| เรื่อง | ทำยังไง | Package |
| --- | --- | --- |
| **1. Validation** (ตรวจข้อมูลที่ส่งเข้ามา) | ตั้ง `ValidationPipe` แบบ global ใน `main.ts` ด้วย `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true` แล้วใส่ decorator เช่น `@IsString()`, `@Min(0)` ใน DTO | `class-validator`, `class-transformer` |
| **2. Config** | อ่านค่าจาก `.env` ผ่าน `ConfigService` เท่านั้น ห้ามใช้ `process.env` กระจายทั่ว project ใช้ `getOrThrow` ให้โปรแกรมหยุดตั้งแต่เริ่มถ้าลืมตั้งค่า | `@nestjs/config` (ติดตั้งแล้ว) |
| **3. Swagger** (เอกสาร API อัตโนมัติ) | ตั้งใน `main.ts` ให้เปิดที่ `/docs` ใช้ทดสอบ API แทน Postman หรือ curl | `@nestjs/swagger` |
| **4. Error handling** | เขียน **exception filter** (ตัวดัก error แล้วแปลงเป็น response) ใน `common/filters/` แปลง error ของ Prisma: `P2002` (ค่าซ้ำ) → 409, `P2025` (ไม่พบข้อมูล) → 404 และ `InsufficientStockError` → 409 | - |
| **5. Test** | **Unit test** (ทดสอบทีละ class) ของ `OrdersService` โดยใช้ repository ปลอม (**mock**) และ **e2e test** (ยิง HTTP จริงตั้งแต่ controller ถึงฐานข้อมูล) ของ `POST /orders` ทั้งกรณีสำเร็จและสต็อกไม่พอ | Vitest + supertest (มากับ CLI) |

```bash
pnpm add class-validator class-transformer @nestjs/swagger
```

ใน `main.ts` ให้เรียก `app.enableShutdownHooks()` ด้วย เพื่อให้ `onModuleDestroy` ของ PrismaService ปิดการเชื่อมต่อฐานข้อมูลเมื่อโปรแกรมถูกสั่งปิด

**Checklist ก่อนติด tag `v0-layered`**

- [ ] M1–M4 เสร็จ และทดสอบผ่าน Swagger ที่ `/docs` แล้ว
- [ ] สั่งเกินสต็อกแล้วสต็อกทุกตัวเท่าเดิม (rollback ทำงาน)
- [ ] Controller ไม่มี business logic และไม่เรียก Prisma ตรง ๆ
- [ ] เงินทุก field เป็น `Decimal`
- [ ] `pnpm lint` และ `pnpm test` ผ่าน และมี e2e test ของ `POST /orders` อย่างน้อย 1 ไฟล์
- [ ] `.env` ไม่อยู่ใน git แต่ `.env.example` อยู่
- [ ] เขียน `01-layered-monolith/README.md` บอกวิธีรัน (compose up → migrate → seed → start)

```bash
git tag v0-layered
git push origin v0-layered
```

## เริ่มใน Claude Code

Export เอกสารนี้เป็น Markdown แล้วบันทึกเป็น `docs/plan-01-layered.md` ใน repo Claude Code จะอ่านแผนนี้ได้โดยตรง จากนั้นเปิด Terminal ที่ `~/dev/nest-architectural-styles` แล้วพิมพ์ `claude`

**Prompt แรก** (copy ไปวางได้เลย)

```
อ่าน CLAUDE.md และ docs/plan-01-layered.md ก่อน
ฉันกำลังทำขั้นที่ 2.1 จะพิมพ์คำสั่งและเขียนโค้ดเองทั้งหมด
ให้คุณอธิบายทีละขั้นว่าคำสั่งนั้นทำอะไร และไฟล์ที่ได้มีไว้ทำไม
ห้ามแก้ไฟล์ใด ๆ เว้นแต่ฉันขอ
```

**Prompt สำหรับรีวิวหลังจบแต่ละ milestone**

```
ฉันเขียน M3 เสร็จแล้ว ช่วยรีวิว git diff ตาม checklist ในขั้นที่ 4
บอกว่าตรงไหนผิดหน้าที่ของ layer หรือไม่ปลอดภัยเรื่อง transaction พร้อมเหตุผล แต่อย่าเพิ่งแก้ให้
```

**Prompt ขอ commit message**

```
เสนอ commit message แบบ Conventional Commits 1 บรรทัดสำหรับสิ่งที่เปลี่ยนใน git diff ตอนนี้
ห้ามรัน git commit ฉันจะ commit เอง
```

**จดสิ่งที่เจอระหว่างทำ** จะใช้เป็น Driver ของการย้ายไป 02-modular-monolith

- แก้เรื่อง order 1 เรื่อง ต้องเปิดกี่โฟลเดอร์
- service ไหนเรียก repository ของเรื่องอื่นบ้าง (เช่น OrdersService → ProductsRepository)
- `app.module.ts` ยาวแค่ไหน เมื่อมี 3 เรื่อง
- ถ้าวันหนึ่งต้องแยก payments ออกไป จะต้องยกไฟล์ไหนออกบ้าง

## แหล่งอ้างอิง

- [Claude Code: Advanced setup](https://code.claude.com/docs/en/setup) - คำสั่งติดตั้งบน Windows และบัญชีที่ใช้ได้
- [NestJS docs: Prisma](https://docs.nestjs.com/data/prisma) - ติดตั้ง Prisma 7, PrismaService, การตั้งค่า ESM/CJS
- [Prisma docs: NestJS guide (v7)](https://www.prisma.io/docs/guides/v7/frameworks/nestjs) - generator `prisma-client`, driver adapter `@prisma/adapter-pg`
- [InfoQ: NestJS 12](https://www.infoq.com/news/2026/10/nestjs-12-observability/) - Node 20.19+/22.12+, CLI ถาม CJS/ESM, class-validator ยังเป็นค่าเริ่มต้น
- [Node 26 Active LTS on October 28](https://bex.co/blog/2026/09/26/node-26-active-lts-builder-default-bump-git-push-paas) - กำหนการ LTS ของ Node 24 และ 26
