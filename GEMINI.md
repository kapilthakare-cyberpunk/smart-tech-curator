# GEMINI.md

## Project Overview

This is a "Smart Tech Curator" application, a modern, single-page web app built with React and Vite. It allows users to save, organize, and discover tech-related resources like articles, code snippets, and tools. The application features a clean, Kanban-style interface for visualizing categorized content. It leverages Tailwind CSS for a utility-first styling approach and includes a dark mode for user comfort.

Key functionalities include:
-   **Resource Management:** Users can add, delete, and view tech resources. Each resource can have a title, a URL, and a personal note.
-   **Smart Categorization:** The application automatically categorizes new entries based on keywords found in the resource's title and URL. This helps in organizing the content with minimal user effort.
-   **AI-Powered Features:** Integration with the Gemini API provides two advanced features:
    -   **AI Auto-Tagging:** When enabled, this feature uses an AI model to analyze the input and automatically determine the most appropriate title, category, and notes for the resource.
    -   **AI Learning Roadmap:** This feature analyzes the user's curated library and generates a personalized learning plan, providing insights and suggesting next steps.
-   **Data Persistence:** All curated items are stored locally in the browser's `localStorage`, ensuring that the user's data is preserved across sessions.
-   **Data Portability:** Users can export their entire collection to a JSON file for backup or migration, and import data from a previously exported file.
-   **Filtering and Search:** A search bar allows for quick filtering of the resources by keyword, making it easy to find specific items.

## Building and Running

The project is configured with standard npm scripts for development and production workflows.

-   **To install dependencies:**
    ```bash
    npm install
    ```

-   **To run the development server:**
    ```bash
    npm run dev
    ```
    This will start a local server, typically at `http://localhost:5173`.

-   **To build for production:**
    ```bash
    npm run build
    ```
    This command bundles the application into static files for production, located in the `dist` directory.

-   **To preview the production build:**
    ```bash
    npm run preview
    ```
    This serves the contents of the `dist` directory locally.

-   **To run the linter:**
    ```bash
    npm run lint
    ```

## Development Conventions

The project follows standard React and web development practices.

-   **Styling:** Tailwind CSS is used for styling. Utility classes are preferred over custom CSS. The configuration is in `tailwind.config.js`.
-   **Linting:** ESLint is configured to enforce code quality and consistency. The configuration can be found in `eslint.config.js`.
-   **State Management:** The application uses React's built-in `useState` and `useEffect` hooks for state management. The main application state is managed within the `App.jsx` component.
-   **API Keys:** The Gemini API key is managed via environment variables. To use the AI features, you must create a `.env.local` file in the project root and add your API key:
    ```
    VITE_GEMINI_API_KEY=your_api_key_here
    ```
-   **Component Structure:** The application is structured around a main `App.jsx` component that orchestrates the entire UI and logic.
