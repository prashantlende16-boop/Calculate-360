# Calculate 360

## Overview

Calculate 360 is a comprehensive web-based calculator suite offering multiple utility calculators including percentage calculations, age calculations, loan EMI/eligibility estimators, currency conversion, BMI calculations, QR code generation, body fat estimation, and unit conversion. The application is built as a single-page React application with a minimal, professional design focused on instant, real-time calculations without page reloads.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (@tanstack/react-query) for server state, local React state for UI
- **Styling**: Tailwind CSS with CSS variables for theming, using a coral & teal color palette
- **UI Components**: shadcn/ui component library (Radix UI primitives) with custom styling
- **Animations**: Framer Motion for smooth transitions and layout animations
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers

### Backend Architecture
- **Server**: Express.js running on Node.js with TypeScript
- **API Structure**: Simple REST API with typed routes defined in `shared/routes.ts`
- **Build System**: Custom build script using esbuild for server bundling and Vite for client

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` defines database tables using Drizzle's schema builder
- **Migrations**: Drizzle Kit handles database migrations, output to `./migrations` folder
- **Session Storage**: connect-pg-simple for PostgreSQL-backed sessions (available but may not be active)

### Project Structure
```
client/           # React frontend
  src/
    components/   # Reusable UI components
    pages/        # Route-level page components
    hooks/        # Custom React hooks
    lib/          # Utility functions
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route definitions
  storage.ts      # Database access layer
  db.ts           # Database connection
shared/           # Shared code between client/server
  schema.ts       # Drizzle database schema
  routes.ts       # API route type definitions
```

### Key Design Patterns
- **Monorepo Structure**: Client and server share types via the `shared/` directory
- **Type-Safe API**: Route definitions include Zod schemas for input validation and response types
- **Component Library**: shadcn/ui pattern with components in `client/src/components/ui/`
- **Path Aliases**: `@/` maps to client/src, `@shared/` maps to shared directory

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### External APIs
- **ExchangeRate-API**: Used for currency conversion (API key embedded in code: `6b761a6b07c8c6d4837599c4`)
- **Google AdSense**: Integrated for monetization (publisher ID: `ca-pub-8009221027375282`)

### Third-Party Libraries
- **QR Code Generation**: `qrcode.react` for generating QR codes client-side
- **Date Handling**: `date-fns` for date calculations and formatting
- **Charts**: Recharts for data visualization (available via shadcn/ui chart component)

### Development Tools
- **Replit Plugins**: vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner for enhanced development experience