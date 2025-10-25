🚀 Admin Panel Dashboard - Enterprise Management System
A comprehensive full-stack admin panel for company management with AI-powered Business Intelligence and RAG (Retrieval-Augmented Generation) capabilities. Built with modern JavaScript/TypeScript stack for scalable enterprise operations.

✨ Features
📊 Core Management Modules

Sales Invoices - Create, track, and manage customer invoices with auto-generated sequential IDs
Proforma Invoices - Generate proforma invoices with customizable templates
Customer Management - Complete CRM with contact information and transaction history
Expense Tracking - Categorized expense management with date range filtering
Employee Management - Full HR module with employee records and department organization
Salary & Payroll - Detailed salary breakdowns with allowances, deductions, and payslip generation
Stock/Inventory - Real-time inventory tracking with low-stock alerts and reorder levels
Settings Module - Configurable tax rates, currency settings, invoice notes, and ID sequences

🤖 AI-Powered Features

Business Intelligence Agent - ChatGPT-powered assistant using Mastra AI framework
RAG Knowledge Base - Upload company documents (PDFs, DOCX, TXT) for AI-powered search
Semantic Document Search - Vector search using Pinecone database and Hugging Face embeddings
Natural Language Queries - Ask questions about invoices, customers, expenses, or company policies
Multi-Tool AI Agent - 6 specialized tools for querying business data and documents

🔐 Security & Auth

OpenID Connect Authentication - Secure login with Replit Auth
Role-Based Access Control - Admin-managed user permissions
Session Management - PostgreSQL-backed secure sessions
Protected API Routes - Authentication middleware on all endpoints

🎨 User Experience

Modern Dark Mode UI - Linear/Stripe-inspired enterprise design
Responsive Design - Works seamlessly on desktop and mobile
Real-time Updates - Auto-refresh for background processing
Export Capabilities - CSV/PDF export for all data modules (planned)
Audit Reports - Comprehensive activity tracking and reporting (planned)

🛠️ Tech Stack

Frontend
React 18 with TypeScript
Wouter - Lightweight routing
TanStack Query (React Query v5) - Data fetching and caching
Shadcn UI - Modern component library
Tailwind CSS - Utility-first styling
Radix UI - Accessible UI primitives
Lucide Icons - Beautiful icon set
Backend
Node.js with Express
TypeScript - Full type safety
Drizzle ORM - Type-safe database queries
PostgreSQL - Relational database (Neon-backed)
Passport.js - Authentication middleware
OpenID Connect - Auth protocol
AI & Machine Learning
Mastra AI - AI agent orchestration framework
OpenAI GPT-4o-mini - Language model for chat
Hugging Face - Free embeddings (BAAI/bge-small-en-v1.5)
Pinecone - Vector database for RAG
Unpdf - PDF text extraction
Mammoth - DOCX text extraction
Development Tools
Vite - Fast build tool and dev server
Zod - Schema validation
Date-fns - Date manipulation
ESBuild - JavaScript bundler

📦 Installation

Prerequisites
Node.js v20+
PostgreSQL 14+
Hugging Face API key (free)
Pinecone API key
Setup
Clone the repository

git clone https://github.com/yourusername/admin-panel-dashboard.git
cd admin-panel-dashboard
Install dependencies

npm install
Set up environment variables

Create a .env file:

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/admin_panel
PGHOST=localhost
PGPORT=5432
PGUSER=your_user
PGPASSWORD=your_password
PGDATABASE=admin_panel
# Session
SESSION_SECRET=your-random-secret-key
# AI & RAG
HUGGINGFACE_API_KEY=hf_your_token
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=admin-knowledge-base

# Create database
psql -U postgres -c "CREATE DATABASE admin_panel;"
# Push schema to database
npm run db:push
Set up Pinecone index

Create index with dimension: 384 (for Hugging Face embeddings)
Metric: cosine
Name: admin-knowledge-base
Run the application

npm run dev
Open in browser

http://localhost:5000

🎯 Usage

AI Business Intelligence
Ask natural language questions:

"Which customers owe me money?"
"What were my top expenses last month?"
"Show me low stock items"
"What's our remote work policy?" (searches uploaded documents)
Knowledge Base RAG
Navigate to Knowledge Base page
Upload company documents (PDF, DOCX, TXT)
System automatically processes and indexes documents
Ask questions in the chat interface
AI searches documents semantically and provides answers
Invoice Management
Create invoices with auto-generated IDs (INV-0001, INV-0002...)
Apply tax rates from Settings
Use quick notes templates
Track payment status


📁 Project Structure
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages
│   │   └── lib/           # Utilities and configs
├── server/                # Backend Express application
│   ├── ai/               # AI agent and tools
│   ├── services/         # Business logic (Pinecone, document processing)
│   ├── routes.ts         # API endpoints
│   └── db.ts            # Database connection
├── shared/               # Shared types and schemas
│   └── schema.ts        # Drizzle database schema
└── design_guidelines.md  # UI/UX design system
🔮 Upcoming Features
 CSV/PDF export for all modules
 Advanced audit reports with filtering
 Dashboard analytics with charts
 Email notifications for invoices
 Multi-currency support
 Automated backup system
 Mobile app (React Native)
🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Built with Mastra AI for AI orchestration
UI components from Shadcn UI
Vector search powered by Pinecone
Free embeddings from Hugging Face
📧 Contact
For questions or support, please open an issue on GitHub.
<img width="934" height="417" alt="image" src="https://github.com/user-attachments/assets/a7d996ff-7d4b-40f5-8a6f-cbb72b7cff01" />

⭐ Star this repo if you find it helpful!
<img width="943" height="443" alt="image" src="https://github.com/user-attachments/assets/7dfc541e-148c-46ba-9222-b54c5454c4e5" />

<img width="947" height="432" alt="image" src="https://github.com/user-attachments/assets/dd2cb624-2948-4d08-afc3-acb647f37e51" />

ali_inayatullah@outlook.com
