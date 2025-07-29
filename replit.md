# RollRite - Professional Bowling Analytics

## Overview

RollRite is a comprehensive bowling analytics application that helps bowlers optimize their performance by tracking bowling ball data, analyzing oil patterns, and providing intelligent ball recommendations. The application features a modern web interface for managing bowling arsenals, viewing performance analytics, and finding the best ball for specific conditions.

## Recent Changes

- **January 29, 2025**: Application branding updated to "RollRite" across all components
- **January 29, 2025**: Added proper HTML title tag for SEO and browser tab display
- **January 29, 2025**: Complete application architecture implemented with all core features functional

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom bowling-themed color palette
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Storage**: PostgreSQL-based sessions using connect-pg-simple
- **Development**: In-memory storage fallback for development/demo purposes

### Database Design
The schema includes five main entities:
- **Users**: Basic user authentication and identification
- **Bowling Balls**: Comprehensive ball specifications including weight, core type, coverstock, surface finish, and performance metrics
- **Oil Patterns**: Professional and custom lane conditions with difficulty ratings
- **Performance Data**: Game-by-game tracking linking balls, patterns, and results
- **Bowler Specs**: Individual bowler characteristics like speed and rev rate

## Key Components

### Data Management
- **Drizzle ORM**: Provides type-safe database queries and migrations
- **Zod Schemas**: Ensures runtime type validation for all data operations
- **Storage Interface**: Abstracted storage layer supporting both PostgreSQL and in-memory implementations

### User Interface Components
- **Navigation**: Responsive navigation with mobile sheet menu
- **Ball Cards**: Visual representation of bowling balls with usage metrics and performance indicators
- **Pattern Cards**: Oil pattern visualization with difficulty and specification details
- **Modal Forms**: Dynamic forms for adding and editing bowling equipment
- **Dashboard Charts**: Performance tracking using Recharts library

### Business Logic
- **Ball Matching Service**: Algorithm that recommends balls based on oil pattern characteristics and bowler specifications
- **Performance Analytics**: Tracks scoring trends, ball usage patterns, and carry percentages
- **Pattern Analysis**: Categorizes oil patterns by difficulty and provides strategic insights

## Data Flow

1. **User Input**: Forms capture bowling ball specifications, performance data, and bowler characteristics
2. **Validation**: Zod schemas validate all inputs before database operations
3. **Storage**: Drizzle ORM handles database interactions with automatic type checking
4. **API Layer**: Express routes provide RESTful endpoints for all CRUD operations
5. **Client Updates**: React Query manages cache invalidation and optimistic updates
6. **UI Rendering**: Components reactively update based on query state changes

## External Dependencies

### Core Infrastructure
- **@neondatabase/serverless**: PostgreSQL database connection for serverless environments
- **Neon Database**: Cloud PostgreSQL hosting with connection pooling

### UI Framework
- **Radix UI**: Accessible component primitives for complex UI elements
- **Lucide React**: Consistent icon library for the interface
- **Recharts**: Chart library for performance visualizations

### Development Tools
- **Vite**: Fast development server with hot module replacement
- **ESBuild**: Production bundling for server-side code
- **PostCSS**: CSS processing with Tailwind compilation

## Deployment Strategy

### Build Process
- **Client Build**: Vite compiles React application to static assets
- **Server Build**: ESBuild bundles Express server with external dependencies
- **Database Migration**: Drizzle Kit handles schema migrations to PostgreSQL

### Environment Configuration
- **Development**: Uses Vite dev server with Express API proxy
- **Production**: Serves static files through Express with API routes
- **Database**: Requires `DATABASE_URL` environment variable for PostgreSQL connection

### Hosting Requirements
- **Node.js Environment**: Supports ES modules and TypeScript compilation
- **PostgreSQL Database**: Persistent storage for user data and analytics
- **Static File Serving**: Express serves built React application in production