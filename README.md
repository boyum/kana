# 🎌 Kana - Master Japanese Kana with Flashcards

Welcome to **Kana**, your friendly companion for learning Japanese hiragana and katakana! Whether you're just starting your Japanese language journey or looking to solidify your kana knowledge, this app makes practice fun, interactive, and effective.

## ✨ What is Kana?

Kana is a flashcard-based learning app designed to help you master the Japanese syllabaries:

- **あ Hiragana** - The flowing, curved script used for native Japanese words
- **ア Katakana** - The angular script used for foreign loanwords
- **✨ Custom Lists** - Create your own personalized study sets and share them with others!

### 🎯 Features

- 📚 **Complete Kana Coverage** - Practice all hiragana and katakana characters
- 🎴 **Interactive Flashcards** - Flip cards to test your knowledge
- ✨ **Custom Lists** - Build and organize your own study materials
- 🔗 **Share & Import** - Share your custom lists with friends or the community
- 💾 **Export/Import Data** - Download and backup all your data as JSON files
- 📋 **Duplicate Lists** - Copy and modify existing lists
- 🎯 **Smart Shuffling** - Advanced shuffling algorithms with multiple modes:
  - **Balanced** - Even distribution of cards
  - **Mastery-focused** - Prioritize cards you know well
  - **Challenge-first** - Focus on difficult cards
- ⚙️ **Configurable Settings** - Customize shuffle modes, card direction, and more
- 🔄 **Flexible Card Direction** - Study front-to-back or back-to-front
- 🌐 **Multilingual** - Available in Norwegian and English
- 📱 **Responsive Design** - Works beautifully on desktop and mobile
- 🔒 **Secure Storage** - User data and configuration stored in Supabase

## 📦 Monorepo Structure

This project is organized as a Turborepo monorepo:

```
kana/
├── apps/
│   ├── web/          # Main SvelteKit application
│   └── admin/        # Admin dashboard (separate app)
├── packages/
│   └── db-services/  # Shared database services
└── turbo.json        # Turborepo configuration
```

### Admin Dashboard

Kana includes a separate admin application for managing public custom lists:

- **Location**: `apps/admin/`
- **Purpose**: Manage example lists, promote user lists, moderate content
- **Access**: Requires admin role in database
- **Setup Guide**: See [ADMIN_SETUP.md](./ADMIN_SETUP.md)

Admin features:
- View all lists in the system
- Promote user lists to example status
- Publish/unpublish lists
- Delete lists
- Search and filter capabilities

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js) or your preferred package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/boyum/kana.git
   cd kana
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in `apps/web/` with your Supabase credentials:

   ```bash
   SUPABASE_URL=your-supabase-url
   PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Set up the database** (if needed)

   For local development with Supabase:

   ```bash
   cd apps/web
   npm run supabase:start
   npm run db:push
   cd ../..
   ```

### Development

Run the development server from the root:

```bash
npm run dev
```

This will start the SvelteKit development server at http://localhost:5173

### Building

Build all apps from the root:

```bash
npm run build
```

### Other Commands

- `npm run lint` - Lint all packages
- `npm run test` - Run tests in all packages
- `npm run check` - Type check all packages
- `npm run format:check` - Check code formatting
- `npm run format:fix` - Fix code formatting

### Working with the Web App

To run commands specifically for the web app:

```bash
cd apps/web
npm run dev              # Start dev server
npm run build            # Build for production
npm run db:studio        # Open Drizzle Studio
npm run storybook        # Start Storybook
npm run supabase:studio  # Open Supabase Studio
npm run supabase:status  # Check Supabase status
```

## 🎮 Using the App

Once the development server is running, the app will be available at `http://localhost:5173` 🎉

### Features Overview

1. **Practice Hiragana** - Navigate to `/hiragana` to practice hiragana characters
2. **Practice Katakana** - Navigate to `/katakana` to practice katakana characters
3. **Custom Lists** - Create your own study sets at `/egendefinert`
4. **Import Lists** - Import shared lists from the community at `/importer`
5. **Settings** - Access the settings modal from any page to:
   - Configure smart shuffling options
   - Set default card direction
   - Change language preferences
   - Export/import your data
   - Manage local storage

## 🛠️ Development

This monorepo uses Turborepo for efficient builds and caching. All commands run from the root automatically execute in the appropriate workspace.

### Project Structure

```text
kana/
├── src/
│   ├── routes/              # SvelteKit routes
│   │   ├── +page.svelte     # Home page (mode selection)
│   │   ├── hiragana/        # Hiragana practice mode
│   │   ├── katakana/        # Katakana practice mode
│   │   └── custom/          # Custom lists management
│   ├── lib/
│   │   ├── components/      # Reusable Svelte components
│   │   ├── data/            # Kana data and definitions
│   │   ├── server/          # Server-side code (auth, db)
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   └── app.html             # HTML template
├── static/                  # Static assets
├── e2e/                     # End-to-end tests
└── messages/                # Internationalization files
```

### Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/) with Svelte 5 - Fast, modern web framework
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Database**: [Supabase](https://supabase.com/) - PostgreSQL database with real-time capabilities
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - Type-safe SQL toolkit
- **Secrets Management**: [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- **Authentication**: [Supabase Auth](https://supabase.com/docs/guides/auth) with GitHub OAuth
- **Testing**:
  - [Vitest](https://vitest.dev/) - Unit testing
  - [Playwright](https://playwright.dev/) - E2E testing
- **UI Components**: [Storybook](https://storybook.js.org/)
- **i18n**: [Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs)
- **Styling**: Native CSS with CSS variables
- **Build Tool**: [Vite](https://vitejs.dev/) & [Turborepo](https://turbo.build/)
- **Deployment**: [Vercel](https://vercel.com/)

### Secrets Management with Vercel

This project uses [Vercel Environment Variables](https://vercel.com/docs/environment-variables) for managing secrets securely.

#### Local Development

1. Create `.env.development.local` in the root directory:

   ```bash
   cp .env.example .env.development.local
   ```

2. Fill in your Supabase credentials:

   ```env
   SUPABASE_URL=https://your-project.supabase.co
   PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

#### Production Deployment

Set environment variables in the Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all required variables
3. Deploy or redeploy your application

For detailed instructions, see [VERCEL_SECRETS.md](./VERCEL_SECRETS.md).

**Note**: Never commit `.env.development.local` or any files containing secrets to the repository.

### Database Management

This project uses Drizzle ORM with Supabase (PostgreSQL). Here's how to manage your database:

#### Local Development with Supabase

```bash
cd apps/web

# Start Supabase locally (requires Docker)
npm run supabase:start

# Check Supabase status
npm run supabase:status

# Open Supabase Studio (visual database editor)
npm run supabase:studio

# Push schema changes to the database
npm run db:push

# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio (alternative visual database editor)
npm run db:studio

# Reset database to initial state
npm run supabase:reset

# Stop Supabase
npm run supabase:stop

# Generate TypeScript types from Supabase schema
npm run supabase:types
```

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run unit tests in watch mode
npm run test:unit -- --watch

# Run e2e tests only
npm run test:e2e

# Run e2e tests in headed mode (see the browser)
npm run test:e2e -- --headed
```

### Component Development with Storybook

Develop and test components in isolation:

```bash
# Start Storybook
npm run storybook
```

Visit `http://localhost:6006` to view your component library.

## 🌍 Internationalization

The app supports multiple languages using Paraglide. Language files are located in the `messages/` directory:

- `en.json` - English translations
- `nb.json` - Norwegian Bokmål translations

To add a new language, create a new JSON file in `messages/` and update the Paraglide configuration.

## 📦 Building for Production

```bash
# Create an optimized production build
npm run build

# Preview the production build locally
npm run preview
```

The build output will be in the `.svelte-kit` directory, ready for deployment.

## 🚢 Deployment

This project is configured for deployment on [Vercel](https://vercel.com/) using the `@sveltejs/adapter-vercel`.

To deploy:

1. Push your code to GitHub
2. Import the project in Vercel
3. Vercel will automatically detect SvelteKit and deploy

For other platforms, you may need to install a different [adapter](https://kit.svelte.dev/docs/adapters).

## 🤝 Contributing

Contributions are welcome! Whether it's:

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- 🌐 Translations

Please feel free to open an issue or submit a pull request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Kana data and learning structure inspired by traditional Japanese language education
- Built with love for language learners everywhere 💙

---

Ready to start your Japanese learning journey? Let's go! 頑張って！(Ganbatte - Good luck!)
