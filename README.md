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
- 💾 **Export Lists** - Download your lists as JSON files
- 📋 **Duplicate Lists** - Copy and modify existing lists
- 🌐 **Multilingual** - Available in Norwegian and English
- 📱 **Responsive Design** - Works beautifully on desktop and mobile

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

3. **Set up the database** (if needed)

   ```bash
   npm run db:push
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   Or open the app in your browser automatically:

   ```bash
   npm run dev -- --open
   ```

The app will be running at `http://localhost:5173` 🎉

## 🛠️ Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build the production-ready app |
| `npm run preview` | Preview the production build locally |
| `npm run check` | Run TypeScript and Svelte type checking |
| `npm run check:watch` | Run type checking in watch mode |
| `npm test` | Run all tests (unit + e2e) |
| `npm run test:unit` | Run unit tests with Vitest |
| `npm run test:e2e` | Run end-to-end tests with Playwright |
| `npm run lint` | Lint the codebase with ESLint |
| `npm run db:push` | Push database schema changes |
| `npm run db:generate` | Generate database migrations |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |
| `npm run storybook` | Start Storybook for component development |
| `npm run build-storybook` | Build Storybook for production |

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

- **Framework**: [SvelteKit](https://kit.svelte.dev/) - Fast, modern web framework
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Database**: [Drizzle ORM](https://orm.drizzle.team/) with LibSQL
- **Authentication**: [@oslojs/crypto](https://oslo.js.org/)
- **Testing**:
  - [Vitest](https://vitest.dev/) - Unit testing
  - [Playwright](https://playwright.dev/) - E2E testing
- **UI Components**: [Storybook](https://storybook.js.org/)
- **i18n**: [Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs)
- **Styling**: Native CSS with CSS variables
- **Deployment**: [Vercel](https://vercel.com/)

### Database Management

This project uses Drizzle ORM with LibSQL. Here's how to manage your database:

```bash
# Push schema changes to the database
npm run db:push

# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio (visual database editor)
npm run db:studio
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
