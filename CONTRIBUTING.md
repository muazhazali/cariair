# Contributing to CariAir

First off, thank you for considering contributing to CariAir! It's people like you that make this project a great tool for the community.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to see if the problem has already been reported. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (e.g., which water brand data is incorrect)
- **Describe the behavior you observed** and what behavior you expected
- **Include screenshots** if applicable
- **Include your environment details** (OS, browser, Node.js version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description** of the suggested enhancement
- **Provide specific examples** to demonstrate the enhancement
- **Explain why this enhancement would be useful**

### Adding Water Data

One of the main ways to contribute is by adding or updating water source data:

1. **Data accuracy**: Ensure all data is accurate and sourced from official documents
2. **Required fields**:
   - Brand name
   - Product name
   - pH level (if available)
   - TDS (Total Dissolved Solids)
   - Mineral composition
   - Source location
   - KKM approval number (for Malaysia products)
3. **Images**: High-quality images of the product bottle
4. **References**: Include links to official sources or lab reports

### Pull Requests

1. Fork the repository
2. Create a new branch from `main`: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests and ensure code quality: `pnpm lint`
5. Commit with clear messages
6. Push to your fork and submit a pull request

#### Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the CHANGELOG.md with your changes
3. Ensure your PR description clearly describes the problem and solution
4. Link any relevant issues

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 10+
- Docker (for PostgreSQL database)

### Recommended: PostgreSQL in Docker, Next.js Locally

This is the fastest development setup with hot reload support:

```bash
git clone https://github.com/muazhazali/cariair.git
cd cariair
cp .env.example .env.local
pnpm install

# Terminal 1: Start PostgreSQL in Docker
pnpm run dev:db

# Terminal 2: Start Next.js dev server (hot reload)
pnpm dev
```

The app will be available at `http://localhost:3000`

### Alternative: Manual PostgreSQL Setup

If you prefer to run PostgreSQL without Docker:

```bash
git clone https://github.com/muazhazali/cariair.git
cd cariair
pnpm install

# Setup PostgreSQL manually
createdb cariair
psql -d cariair -f sql/schema.sql

# Start dev server
pnpm dev
```

## Style Guidelines

### Code Style

- We use TypeScript for type safety
- Follow the existing code structure
- Use meaningful variable names
- Comment complex logic
- Keep functions small and focused

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

Example:
```
Add pH level filter to search

- Add slider component for pH range
- Update API to handle pH filters
- Closes #123
```

## Community

- Join discussions in GitHub Issues
- Help others by answering questions
- Share the project with others who might find it useful

## Questions?

Feel free to open an issue for any questions or concerns.

Thank you for contributing! 💧
