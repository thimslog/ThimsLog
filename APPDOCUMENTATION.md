# ThimsLog - Application & System Documentation

Welcome to the comprehensive architecture and technical documentation for **ThimsLog**. This document outlines the application architecture, database schemas, authentication flows, Support Ticket system, Admin & User dashboards, API specifications, and frontend design patterns.

---

## 1. System Overview & Technology Stack

ThimsLog is a modern full-stack web application built on **Next.js App Router** with a dual-role portal structure:
1. **User Dashboard** (`/dashboard`): Allows customers to browse products, manage their wallet, track order history, view transactions, and interact with the Support Ticket & Help Center systems.
2. **Admin Portal** (`/admin`): Provides administrators with oversight over all system activities, including User Management, Transaction Settlement & Verification, Support Ticket Resolution, Inventory Management, and System Settings.

### Technology Stack
- **Framework**: Next.js 15+ (App Router, Server Components & Client Components)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS with custom dark/light theme tokens and glassmorphism UI components
- **Database & ORM**: PostgreSQL with Prisma ORM (modular schema design)
- **Authentication**: Stateless JWT in HTTP-only cookies with role segregation (`admin_token` vs `user_token`)
- **State Management**: React Hooks (`useCallback`, `useRef`, `useSearchParams`, `useRouter`, Custom Context Providers)

---

## 2. Database Schema & Data Models

The Prisma schema is organized into modular files within `prisma/models/` and referenced via `prisma/enums.prisma`.

### 2.1 Enums (`prisma/enums.prisma`)
```prisma
enum Role {
  USER
  ADMIN
  SUPERADMIN
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}

enum TicketPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TransactionType {
  FUNDING
  PAYMENT
  REFUND
}

enum TransactionStatus {
  PENDING
  SUCCESS
  FAILED
  UNDERPAID
  OVERPAID
  EXPIRED
}
```

### 2.2 Core Models Summary

| Model | File Path | Description |
| :--- | :--- | :--- |
| `User` | `prisma/models/user.prisma` | Customer accounts with credentials, profile details, wallet reference, orders, and tickets. |
| `Wallet` | `prisma/models/wallet.prisma` | User balance ledger (`balance`, `currency`, relations to transactions). |
| `Transaction` | `prisma/models/transaction.prisma` | Payment and funding records with merchant references, gateway status, and amounts. |
| `SupportTicket` | `prisma/models/ticket.prisma` | Customer support inquiries with priorities (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) and lifecycle statuses (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`). |
| `TicketResponse` | `prisma/models/ticket.prisma` | Message thread entries within a support ticket (records `senderType: "USER" \| "ADMIN"`). |
| `HelpCenterConfig`| `prisma/models/helpcenter.prisma` | Dynamic configuration for external channels (WhatsApp, Telegram, Phone, Email). |
| `Admin` | `prisma/models/admin.prisma` | Admin user accounts with role permissions. |
| `AdminAuditLog` | `prisma/models/adminauditlog.prisma`| Tracks administrative actions for accountability. |
| `InventoryAccount`| `prisma/models/InventoryAccount.prisma`| Digital product inventory records. |
| `Order` | `prisma/models/order.prisma` | Customer purchase orders. |

---

## 3. Support Ticket System

The Support Ticket system connects users and administrators through an interactive messaging workflow.

### 3.1 Resilience & In-Memory Store (`src/lib/ticket-store.ts`)
To prevent runtime 500 errors when database migrations are pending or during development, a shared fallback store (`fallbackTickets`) is maintained with thread management helpers:
- `addFallbackTicket(ticket)`
- `findFallbackTicket(id)`
- `updateFallbackTicket(id, updates)`
- `addFallbackResponse(ticketId, response)`

### 3.2 User Experience & Workflows
1. **Open Ticket** (`/dashboard/help-center/tickets/create`):
   - Users submit a ticket by providing a `Subject`, `Priority` (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), and detailed `Message`.
   - File attachments were removed per business specifications to streamline initial submission.
2. **My Tickets List** (`/dashboard/help-center/tickets`):
   - Displays all active and past tickets with status badges, priority indicators, and response counts.
   - Includes a prominent **"Refresh Tickets"** button for real-time status checking.
3. **Conversation Thread** (`/dashboard/help-center/tickets/[id]`):
   - Chronological message history distinguishing between Customer messages and Admin replies.
   - **Status-Locked Replies**: If a ticket is marked as `RESOLVED` or `CLOSED`, user replies are disabled with an informative banner.
   - Users can refresh the conversation at any time with an instant manual reload trigger.

### 3.3 Admin Experience & Workflows
1. **Admin Tickets Dashboard** (`/admin/tickets`):
   - Live KPI overview cards (Total Tickets, Open Tickets, In Progress, Resolved).
   - Filter by status (`ALL`, `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`).
   - Search by Subject, Ticket ID, or Customer Email/Name.
2. **Admin Reply & Status Control Modal**:
   - Full conversation inspection with customer profile details.
   - Admin response composition.
   - **Configurable Status Transition**: Allows the admin to keep the current status or transition the ticket to `IN_PROGRESS`, `RESOLVED`, or `CLOSED`.

---

## 4. Order Management & Delivered Account Credentials

The Order History (`/dashboard/order-history`) and Dashboard Recent Orders components provide secure access to purchased social inventory.

### 4.1 Delivered Account Details
Each delivered account card displays:
- **Username**: Clean handle (`@username`) with single-click dedicated copy.
- **Email**: Associated email address (`email@domain.com`) with single-click copy.
- **Login Format / Credentials**: Monospace credential code box (e.g. `user:pass:2fa`, recovery emails, tokens) with dedicated copy button.
- **Notes & Instructions**: Callout box containing backup codes, login guidelines, and vendor remarks.
- **Country / Region**: Regional badge (e.g. USA, UK, NG).
- **Followers & Stats**: Audience count metrics.
- **Profile Link**: Direct clickable URL to verify the account.

### 4.2 Clean Clipboard Copying
- **No Order ID or UUID Pollution**: Clipboard operations format pure credentials (Username, Email, Credentials, Notes, URL) without database UUIDs or Order IDs.
- **Individual Field Copies**: Instant 1-click copy icons next to username, email, and login credentials.
- **Master "Copy All Credentials"**: Copies a structured plain-text list of all delivered accounts within an order.

---

## 5. Admin Management Dashboards & Performance Optimizations

### 4.1 URL-Persisted State & Pagination
Both the **Transactions** (`/admin/transactions`) and **Users** (`/admin/users`) pages utilize URL query synchronization (`?page=2&status=PENDING&type=FUNDING&search=john`):
- **Bookmarkable & Shareable**: Filtered states and pagination are preserved across page reloads and browser link sharing.
- **Browser History Integration**: Integrated with `popstate` event listeners to support seamless browser Back/Forward navigation.

### 4.2 Smooth Pagination & Zero-Layout Shift
- **Auto-Scroll Prevention**: Configured with `{ scroll: false }` on `router.push` and `router.replace` to prevent window jumps to `(0, 0)` when navigating pages.
- **Permanent Pagination Bar**: The pagination controls remain permanently mounted instead of unmounting during network fetches.
- **Table Height Retention**: Table rows transition smoothly with `opacity-50 pointer-events-none` during background re-fetching rather than collapsing to a single spinner row.

### 4.3 Debounced Search with Isolated Typing State
- **350ms Debounce**: Automatically triggers queries after user stops typing.
- **Independent Input State**: The input field value (`searchQuery`) is decoupled from URL sync loops so that typing is never interrupted or overwritten mid-keystroke.

---

## 5. API Reference

### 5.1 Support Ticket Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/user/tickets` | User (JWT) | Fetch all support tickets opened by the current authenticated user. |
| `POST` | `/api/user/tickets` | User (JWT) | Create a new support ticket (`subject`, `priority`, `message`). |
| `GET` | `/api/user/tickets/[id]` | User (JWT) | Retrieve a single support ticket and all associated replies. |
| `POST` | `/api/user/tickets/[id]/reply` | User (JWT) | Post a customer reply to an active ticket (rejected if status is `RESOLVED` or `CLOSED`). |
| `GET` | `/api/admin/tickets` | Admin (JWT) | Retrieve all system tickets with optional `?status=...&search=...` filters. |
| `GET` | `/api/admin/tickets/[id]` | Admin (JWT) | Fetch full details and conversation history for any ticket. |
| `PATCH`| `/api/admin/tickets/[id]` | Admin (JWT) | Update ticket status (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`) or priority. |
| `POST` | `/api/admin/tickets/[id]/reply` | Admin (JWT) | Post an administrator reply and optionally update ticket status. |

### 5.2 User, Admin & Transaction Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Admin (JWT) | Aggregates all KPI metrics (revenue, wallet liability, orders, inventory stock, pending queries, urgent tickets, and live feeds). |
| `GET` | `/api/user/getAllUsers` | Admin (JWT) | Paginated list of registered users with wallet balance and search filters. |
| `GET` | `/api/admin/transactions` | Admin (JWT) | Paginated list of transactions with volume metrics, status filters, and user info. |
| `POST` | `/api/admin/transactions/[id]/verify` | Admin (JWT) | Requeries Paymonetra gateway for pending transactions and updates wallet balances on success. |
| `GET` | `/api/user/help-center` | Public/User | Retrieves active dynamic support contact channels (WhatsApp, Telegram, etc.). |
| `POST` | `/api/admin/help-center` | Admin (JWT) | Updates support channel URLs and customer support availability. |

---

## 6. Directory Structure & Key Files

```
src/
├── app/
│   ├── (admin)/admin/
│   │   └── (dashboard)/
│   │       ├── tickets/page.tsx          # Admin Ticket Management
│   │       ├── transactions/page.tsx     # Admin Transactions & Payment Querying
│   │       ├── users/page.tsx            # Admin User Directory & Wallets
│   │       ├── help-center/page.tsx      # Admin Help Center Configuration
│   │       └── inventory/                # Inventory Management
│   ├── (user)/dashboard/
│   │   ├── help-center/
│   │   │   ├── page.tsx                  # Help Center Hub & "View My Tickets"
│   │   │   └── tickets/
│   │   │       ├── page.tsx              # User Tickets List with Refresh
│   │   │       ├── create/page.tsx       # User Open Ticket Form
│   │   │       └── [id]/page.tsx         # User Conversation Thread
│   │   ├── transactions/page.tsx         # User Personal Transactions
│   │   └── wallet/page.tsx               # User Wallet Top-up & Balance
│   └── api/
│       ├── admin/
│       │   ├── tickets/                  # Admin Ticket APIs
│       │   └── transactions/             # Admin Transaction & Verification APIs
│       └── user/
│           ├── tickets/                  # User Ticket APIs
│           └── getAllUsers/              # Admin User Listing API
├── components/
│   ├── admin/                            # Admin Navbar, Sidebar, Status Pills
│   ├── dashboard/                        # User Dashboard Cards, WhatsApp Card, Nav
│   └── ui/                               # Shared UI (Modals, Toast, Buttons)
└── lib/
    ├── prisma.ts                         # Prisma Client Singleton
    ├── jwt.ts                            # Admin & User Token Verification
    ├── get-current-user.ts               # Request User Context Resolver
    └── ticket-store.ts                   # In-memory Ticket Store Fallback
```

---

## 7. Progressive Web App (PWA) & Offline Capabilities

ThimsLog is a fully installable **Progressive Web App (PWA)** providing native-app feel across Android, iOS, Windows, macOS, Chrome, and Edge.

### 7.1 Web App Manifest (`public/manifest.json` & `src/app/manifest.ts`)
- **Display**: Standalone window with custom brand colors (`theme_color: #0284c7`, `background_color: #060a14`).
- **Icons**: Responsive multi-density icons (192x192, 512x512, and maskable).
- **App Shortcuts**: Direct system launcher shortcuts for Dashboard, Products Catalog, Order History, and Help Center.

### 7.2 Service Worker (`public/sw.js`)
- **Caching Strategy**:
  - **Dynamic Routes & APIs**: Network-first strategy to ensure real-time financial and ticket updates.
  - **Static Assets**: Cache-first with background revalidation for fast rendering of icons, logos, fonts, CSS, and JS bundles.
  - **Offline Fallback**: Offline fallback page support during lost connectivity.

### 7.3 Smart Install Prompt (`src/components/pwa/PwaRegister.tsx`)
- **Desktop & Android**: Automatic interception of `beforeinstallprompt` event with a floating in-app **"Install Thimslog App"** prompt banner.
- **iOS Safari**: Integrated guide modal showing **"Share -> Add to Home Screen"** instructions.

---

---

## 8. Peer-to-Peer (P2P) Internal Wallet Transfers & In-App Notifications

### 8.1 P2P Fund Transfer Workflow
Customers can send wallet balance to any registered Thimslog customer with zero transaction fees:
1. **Recipient Lookup & Live Verification** (`/api/wallet/transfer/lookup?username=...`):
   - Debounced lookup dynamically queries the recipient by username.
   - Confirms the recipient's full name, username, and verified badge before money is sent.
   - Prevents self-transfers and transfers to non-existent accounts.
2. **Race-Condition & Double-Spend Prevention**:
   - Executes inside `prisma.$transaction`.
   - Acquires PostgreSQL row-level locks (`SELECT * FROM "Wallet" WHERE "userId" = ... FOR UPDATE`) in deterministic sorted order to prevent deadlocks and race conditions.
   - Validates balance at the locked row level before balance decrement/increment.
   - Creates double-entry audit records: `TRANSFER_SENT` (debit) for Sender and `TRANSFER_RECEIVED` (credit) for Recipient.
3. **In-App Notification Dispatch**:
   - Automatically generates a `TRANSFER_RECEIVED` notification for Customer B ("You received ₦X from @username") and a `TRANSFER_SENT` notification for Customer A.

### 8.2 In-App Notification System
- **Prisma Model** (`prisma/models/notification.prisma`):
  - Fields: `id`, `userId`, `title`, `message`, `type` (`SYSTEM`, `TRANSFER_SENT`, `TRANSFER_RECEIVED`, `ORDER_UPDATE`, `WALLET_FUNDED`), `read` (boolean), `metadata` (JSON), `createdAt`.
- **Topbar Bell & Badge** (`src/components/dashboard/NotificationBell.tsx`):
  - Displays real-time unread count badge.
  - Floating popover preview with quick "Mark as Read", relative timestamps, and direct link to notification center.
  - Periodic background polling ensures instant updates.
- **Notification Center Page** (`/dashboard/notifications`):
  - Tabbed filters for **All** and **Unread** notifications.
  - One-click **"Mark All as Read"** and individual mark-read actions.
  - Rich badges and formatted transfer summaries.

### 8.3 Username Management & 3-Month Edit Rule
- **Display & 1-Click Copy**:
  - Displayed prominently in the **Profile Settings Header** (`/dashboard/settings`), **Sidebar Profile Card** (`SidebarProfile.tsx`), and **Overview Balance Card** (`BalanceCard.tsx`) with a 1-click copy badge (`@username`).
- **3-Month Rate Limit (Cooldown)**:
  - Users can change their username only once every 3 months (90 days).
  - The system tracks `usernameChangedAt` on the `User` model.
  - If changed within 90 days, the input is disabled and locked with an exact countdown: *"🔒 Username locked: Next change available in X days on Month DD, YYYY"*.
- **Strict Uniqueness & Format Validation**:
  - Live debounced uniqueness check via `GET /api/user/profile/check-username?username=...`.
  - Enforces 3-30 character alphanumeric and underscore format (`/^[a-zA-Z0-9_]{3,30}$/`).
  - Strict case-insensitive uniqueness validation on the database level.

---

## 9. Setup & Deployment Guidelines

### 9.1 Environment Variables
Ensure the following keys are present in `.env`:
```env
DATABASE_URL="postgresql://user:password@host:port/dbname?schema=public"
JWT_SECRET="your-secure-jwt-secret"
ADMIN_JWT_SECRET="your-secure-admin-jwt-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PAYMONETRA_API_KEY="your-paymonetra-key"
PAYMONETRA_SECRET_KEY="your-paymonetra-secret"
```

### 9.2 Database Migration Commands
To synchronize your database schema with the Prisma models:
```bash
# Push schema updates to the database
npx prisma db push

# Generate updated Prisma client types
npx prisma generate
```

### 9.3 Development & Build
```bash
# Run local development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

