# SSIT Notes Hub 📚

**SSIT Notes Hub** is a study material platform built for students of **Shree Swaminarayan Institute of Technology (SSIT), Gandhinagar** — covering **BCA, MCA, and IT** courses. Students can browse notes, textbooks, previous year question papers (PYQs), and practicals by course/semester/subject, upload their own material, view PDFs in-browser, download them, and bookmark resources for quick access later. An integrated **AI Assistant** helps students find material and navigate the site through natural conversation.

No login is required — the site opens directly to the home dashboard.

## ✨ Features

- **Browse by Course → Semester → Subject** — Material for **BCA** (6 semesters), **MCA** (4 semesters), and **IT** (6 semesters) is organized hierarchically for easy navigation.
- **Multiple Resource Types** — Textbooks, Notes, Previous Year Papers (PYQs), and Practicals, each filterable by type.
- **Upload PDFs** — Any student can upload a PDF with a title, description, course, semester, subject, and category; files are uploaded straight to cloud storage and appear instantly.
- **View & Download** — Every document has an in-browser PDF viewer (powered by `pdf.js`) plus a direct download option.
- **Global Search** — Search across all subjects and uploaded material from anywhere on the site.
- **Bookmarks** — Save any PDF with one tap; bookmarks are stored in the browser's Local Storage, so they persist across visits on the same device (no account needed).
- **AI Chat Assistant** — A built-in chatbot that answers questions about the site's content (e.g. *"Where can I find DBMS notes?"*), helps students navigate the Hub, and can explain academic topics in short, student-friendly answers — without ever inventing files that don't exist on the site.
- **Fully Responsive** — Works across desktop, laptop, tablet, and mobile.

## 🖥️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router) (React 19, file-based routing, SSR) |
| Styling / UI | Tailwind CSS 4 + [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives) |
| Data Fetching | TanStack Query |
| Forms & Validation | React Hook Form + Zod |
| Backend / Database | [Supabase](https://supabase.com/) (Postgres database, Storage for PDFs, Row Level Security) |
| PDF Rendering | `pdf.js` (`pdfjs-dist`) |
| AI Chatbot | Server route (`/api/chat`) proxying to an AI gateway (Lovable AI Gateway) |
| Build Tool | Vite |
| Language | TypeScript |
| Scaffolded with | [Lovable](https://lovable.dev) |

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS recommended) and npm — or [Bun](https://bun.sh/), since a `bun.lock` is included
- A [Supabase](https://supabase.com/) project (for the database, auth-free storage, and PDF bucket)

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/ssitnoteshub.git
cd ssitnoteshub

# Install dependencies
npm install
# or: bun install

# Set up environment variables (see below)
cp .env.example .env

# Run the development server
npm run dev
```

The app will be available at the local URL printed in your terminal (Vite default: `http://localhost:5173`).

### Environment Variables

Create a `.env` file in the project root with:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_PROJECT_ID=your-supabase-project-id
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key

SUPABASE_URL=your-supabase-project-url
SUPABASE_PROJECT_ID=your-supabase-project-id
SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key

# Server-side key for the AI chat assistant (/api/chat route)
LOVABLE_API_KEY=your-ai-gateway-api-key
```

> ⚠️ Never commit your real `.env` file. Keep only an `.env.example` with placeholder values in the repository.

### Database Setup

Run the SQL migrations in `supabase/migrations/` against your Supabase project (via the Supabase CLI or SQL editor) to create the `documents` table, storage policies, and the `pdfs` storage bucket used for uploads.

### Available Scripts

```bash
npm run dev        # Start the development server
npm run build       # Build for production
npm run preview     # Preview the production build
npm run lint         # Run ESLint
npm run format      # Format code with Prettier
```

## 📖 Usage

1. Open the site — you land directly on the **Home Dashboard**, no sign-in needed.
2. Choose a course (**BCA / MCA / IT**), then a semester, then a subject.
3. Browse **Notes**, **PYQs**, and **Practicals** for that subject, or use **Global Search** to find material instantly.
4. Click **View** to open a PDF in the built-in viewer, or **Download** to save it.
5. Click the **bookmark icon** on any PDF to save it — visit **My Bookmarks** anytime to see everything you've saved on that device.
6. Click **Upload** to add your own PDF: pick a course, semester, subject, category, and title, and it becomes instantly visible to everyone.
7. Use the **AI Assistant** (chat icon) to ask things like *"Where can I find DBMS notes for BCA sem 3?"* — it searches the site's material and guides you there, or explains a concept if you're stuck.

## 📁 Project Structure

```
ssitnoteshub-main/
├── src/
│   ├── routes/                  # File-based routes (TanStack Router)
│   │   ├── index.tsx             # Home dashboard
│   │   ├── course.$course.index.tsx           # Course → semesters
│   │   ├── course.$course.$semester.index.tsx # Semester → subjects
│   │   ├── course.$course.$semester.$subject.tsx # Subject → documents
│   │   ├── bookmarks.tsx         # My Bookmarks page
│   │   └── api/chat.ts           # AI chat assistant server route
│   ├── components/               # ChatAssistant, UploadDialog, DocumentCard,
│   │                              # GlobalSearch, PdfViewerDialog, site header/footer, ui/ (shadcn components)
│   ├── lib/                      # catalog.ts (courses/subjects), documents.ts,
│   │                              # bookmarks.ts (LocalStorage), search-hints.ts
│   ├── integrations/supabase/    # Supabase client + auth helpers
│   └── styles.css
├── supabase/
│   └── migrations/               # SQL migrations for the documents table & storage policies
├── public/                       # Static assets
├── package.json
└── README.md
```

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Commit your changes (`git commit -m "Add: your feature"`)
4. Push to the branch (`git push origin feature/your-feature-name`)
5. Open a Pull Request

## 🐛 Issues

Found a bug or have a feature request? Please open an [issue](https://github.com/<your-username>/ssitnoteshub/issues).

## 📄 License

Update this section with your chosen license (e.g. MIT).

## 👤 About

Built for the students of **Shree Swaminarayan Institute of Technology (SSIT), Gandhinagar** to make finding and sharing course material simple.

---

⭐ If you find this project useful, consider giving it a star on GitHub!
