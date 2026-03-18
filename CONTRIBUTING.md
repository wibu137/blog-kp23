# Contributing to blog-kp23

First off, thank you for considering contributing to **blog-kp23**! It's people like you who make this project such a great tool for the community.

To ensure a smooth and productive collaboration, please take a moment to review the following guidelines before you get started.

---

## 📝 Table of Contents
- [Code of Conduct](#-code-of-conduct)
- [How Can I Contribute?](#-how-can-i-contribute)
- [Pull Request Process](#-pull-request-process)
- [Coding Standards](#-coding-standards)
- [Commit Message Guidelines](#-commit-message-guidelines)

---

## 🤝 Code of Conduct
We are committed to fostering a welcoming and positive community. We expect all contributors to be respectful, professional, and constructive in all interactions.

## 💡 How Can I Contribute?
There are many ways to help the project:
- **Reporting Bugs:** If you find a bug, please open an [Issue](https://github.com/wibu137/blog-kp23/issues) with a clear title, a detailed description, and steps to reproduce.
- **Suggesting Features:** Have an idea? Open an Issue to discuss potential new features.
- **Code Contributions:** Fix bugs or implement new features by submitting a Pull Request (PR).
- **Documentation:** Help us improve the README or other documentation files.

---

## 🚀 Pull Request Process
To contribute code, please follow this professional workflow:

1. **Fork** the repository to your own GitHub account.
2. **Clone** your fork to your local machine:
   ```bash
   git clone https://github.com/your-username/blog-kp23.git
3. **Create a new Branch** for your work. Use a descriptive prefix to help us identify the purpose of your changes:
   - `feat/` for new features.
   - `fix/` for bug fixes.
   - `docs/` for documentation changes.
   - `refactor/` for code improvements that don't change functionality.
   
   *Example:* `git checkout -b feat/add-dark-mode`

4. **Implement your changes** and ensure your code is stable and runs correctly in your local environment.
5. **Commit your changes** with a clear message following our [Commit Message Guidelines](#-commit-message-guidelines).
6. **Push the branch** to your fork on GitHub:
   ```bash
   git push origin feat/add-dark-mode
---

## 💻 Coding Standards
To maintain high code quality and consistency across the **blog-kp23** project, please adhere to the following standards:

- **Linting & Formatting:** 
  - Ensure your code passes all linting checks. If the project includes **ESLint** and **Prettier** configurations, please run them before committing.
  - Follow the existing indentation and coding style of the file you are editing.
- **Clean Code Principles:** 
  - Write readable and self-explanatory code. 
  - Use descriptive variable and function names (e.g., `fetchUserData` instead of `getData`).
  - Keep functions small and focused on a single responsibility.
- **Comments:** 
  - Avoid obvious comments. Only add comments to explain "Why" a complex logic was implemented, not "What" the code is doing.
- **Environment Variables:** 
  - If your changes require new environment variables, add them to the `.env.local` file with a placeholder value.
- **Dependencies:** 
  - Be mindful of the bundle size. Avoid adding heavy third-party libraries if a native or lightweight solution is available.

---

## 📌 Commit Message Guidelines
We follow the **Conventional Commits** specification. This helps us generate automated changelogs and makes the project history easy to navigate.

Each commit message should follow this format:
`<type>(<scope>): <description>`

### Common Types:
- `feat`: A new feature for the user.
- `fix`: A bug fix.
- `docs`: Documentation changes only (e.g., README, CONTRIBUTING).
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.).
- `refactor`: A code change that neither fixes a bug nor adds a feature.
- `perf`: A code change that improves performance.
- `chore`: Updating build tasks, package manager configs, etc.; no production code change.
- `test`: Adding missing tests or correcting existing tests.

### Examples:
- `feat(ui): add search bar to navigation`
- `fix(auth): resolve login timeout on mobile devices`
- `docs: update setup instructions in README`
- `style: format code using prettier`
- `refactor(api): simplify user data fetching logic`

---

Thank you for your contribution! We look forward to your Pull Request. Happy coding! ❤️
