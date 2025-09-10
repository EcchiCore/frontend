# Frontend

This is the frontend of the Chanomhub project.

## Technologies

- [Next.js](https://nextjs.org/) - React framework for production
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Docker](https://www.docker.com/) - Containerization platform
- [ESLint](https://eslint.org/) - Pluggable and configurable linter tool for identifying and reporting on patterns in JavaScript
- [Prettier](https://prettier.io/) - Opinionated code formatter
- [Bun](https://bun.sh/) - Fast JavaScript all-in-one toolkit
- [Snyk](https://snyk.io/) - Find and automatically fix vulnerabilities in your code

## Running the project

1.  Install dependencies:
    ```bash
    bun install
    ```
2.  Run the development server:
    ```bash
    bun dev
    ```

## Project Structure

- **.intlayer/**: This directory contains the internationalization (i18n) configuration and generated files.
- **.next/**: This directory is where Next.js stores its build output.
- **locales/**: This directory contains the application's translation files.
- **node_modules/**: This directory contains all of the project's dependencies.
- **public/**: This directory contains static assets that are publicly accessible.
- **src/**: This directory contains the application's source code.
  - **app/**: This directory contains the application's pages and layouts.
  - **components/**: This directory contains the application's reusable components.
  - **content/**: This directory contains the application's content.
  - **i18n/**: This directory contains the application's i18n configuration.
  - **lib/**: This directory contains the application's utility functions.
  - **messages/**: This directory contains the application's translation files.
  - **types/**: This directory contains the application's TypeScript types.
  - **utils/**: This directory contains the application's utility functions.
- **.vscode/**: This directory contains the project's VS Code configuration.
