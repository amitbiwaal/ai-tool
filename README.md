# AI Tools Directory

A modern, full-featured AI tools directory built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

### Core Functionality
- 🔍 **Advanced Search & Filters** - Search tools by name, category, pricing, rating, and tags
- 📊 **Tool Comparison** - Side-by-side comparison of AI tools
- ⭐ **Reviews & Ratings** - User-generated reviews and ratings system
- ❤️ **Favorites** - Save and manage favorite tools
- 📱 **Responsive Design** - Optimized for all devices
- 🌙 **Dark Mode** - Built-in theme switching

### User Features
- 👤 **User Authentication** - Secure authentication via Supabase
- 📝 **Tool Submission** - Community-driven tool submissions
- 💬 **User Dashboard** - Manage favorites, submissions, and profile
- ✍️ **Write Reviews** - Share experiences with AI tools

### Admin Features
- 🛠️ **Admin Panel** - Comprehensive admin dashboard
- ✅ **Moderation Workflow** - Approve/reject tool submissions
- 📈 **Analytics Dashboard** - View stats and metrics
- 🏷️ **Category Management** - Create and manage categories
- 📰 **Blog Management** - Create and publish blog posts

### Technical Features
- 🚀 **Next.js 14 App Router** - Latest Next.js features with App Router
- 💨 **ISR/SSG** - Optimized performance with Static Site Generation
- 🔐 **Row Level Security** - Secure data access with Supabase RLS
- 📱 **SEO Optimized** - Full metadata, sitemap, and structured data
- 🎨 **Modern UI** - Built with Tailwind CSS and custom components
- 📊 **Type Safety** - Full TypeScript implementation

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **State Management:** Zustand
- **Deployment:** Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-tools-directory
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=AI Tools Directory

# Google Analytics & Verification (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_verification_code
```

4. **Set up Supabase**

- Create a new Supabase project
- Run the SQL schema from `lib/supabase/schema.sql` in the Supabase SQL editor
- Enable email authentication in Supabase Auth settings

5. **Seed the database (optional)**
```bash
npm run seed
```

6. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
ai-tools-directory/
├── app/                      # Next.js App Router pages
│   ├── api/                 # API routes
│   ├── admin/               # Admin panel pages
│   ├── auth/                # Authentication pages
│   ├── blog/                # Blog pages
│   ├── category/            # Category pages
│   ├── dashboard/           # User dashboard
│   ├── tools/               # Tool listing and detail pages
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Homepage
├── components/              # React components
│   ├── ui/                  # Base UI components
│   ├── navbar.tsx           # Navigation
│   ├── footer.tsx           # Footer
│   ├── tool-card.tsx        # Tool card component
│   └── ...                  # Other components
├── lib/                     # Utility functions and configurations
│   ├── supabase/           # Supabase client and schema
│   ├── store/              # State management (Zustand)
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Utility functions
├── scripts/                 # Utility scripts
│   └── seed.js             # Database seeding script
└── public/                  # Static assets
```

## Database Schema

The application uses the following main tables:

- **profiles** - User profiles extending Supabase auth
- **tools** - AI tool listings
- **categories** - Tool categories
- **tags** - Tool tags
- **reviews** - User reviews
- **favorites** - User favorites
- **blog_posts** - Blog content
- **submissions** - Tool submission tracking

See `lib/supabase/schema.sql` for the complete schema.

## Key Features Implementation

### Search & Filtering
- Full-text search across tool names, taglines, and descriptions
- Multi-select filters for categories, tags, and pricing
- Rating-based filtering
- Sort by newest, popular, rating, or name

### User Authentication
- Email/password authentication via Supabase
- Protected routes for dashboard and admin areas
- Row-level security policies

### Tool Submission Workflow
1. User submits tool via form
2. Tool enters "pending" status
3. Admin reviews and approves/rejects
4. Approved tools appear in directory

### SEO Optimization
- Dynamic metadata for all pages
- Automated sitemap generation
- Robots.txt configuration
- Open Graph tags
- JSON-LD structured data

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The application can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted with Node.js

## Configuration

### Supabase Setup

1. **Authentication**: Enable email provider in Supabase Auth settings
2. **Database**: Run the schema.sql file to create tables
3. **Storage** (optional): Set up buckets for image uploads
4. **Row Level Security**: Policies are included in schema.sql

### Customization

- **Branding**: Update site name and colors in `app/layout.tsx` and `tailwind.config.ts`
- **Categories**: Modify default categories in `scripts/seed.js`
- **Features**: Add/remove features based on your needs

## Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Utilities
npm run lint         # Run ESLint
npm run seed         # Seed database with sample data
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For questions or issues:
- Open an issue on GitHub
- Contact: hello@aitoolsdirectory.com

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Public API
- [ ] Advanced analytics
- [ ] AI-powered recommendations
- [ ] Premium tool listings
- [ ] Affiliate integration
- [ ] Newsletter system
- [ ] Advanced search with Elasticsearch

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database by [Supabase](https://supabase.com/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)

---

Built with ❤️ for the AI community

