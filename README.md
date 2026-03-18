# Blog-KP23 🚀

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)](https://nextjs.org/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-blue?logo=clerk)](https://clerk.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-green?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-TailwindCSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

A modern, high-performance full-stack blog application built with **Next.js**, **Clerk** for seamless authentication, and **MongoDB** for robust data management.

---
## 📑 Table of Contents

- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [⚙️ Getting Started](#️-getting-started)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Installation](#2-installation)
  - [3. Environment Variables](#3-environment-variables)
  - [4. Run the Application](#4-run-the-application)
- [📂 Project Structure](#-project-structure)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [📞 Contact](#-contact)
---
## ✨ Features

- 🔐 **Authentication:** Secure login/signup with Clerk (Google, GitHub, Email/Password).
- 📝 **Content Management:** Full CRUD operations for blog posts.
- 📂 **Database Integration:** Scalable data storage using MongoDB & Mongoose/Prisma.
- 🌓 **Theming:** Dark and Light mode support with Tailwind CSS.
- 📱 **Fully Responsive:** Optimized for mobile, tablet, and desktop.
- 🚀 **Server-Side Rendering:** Leveraging Next.js Server Components for SEO and speed.

---

## 🛠 Tech Stack

- **Framework:** Next.js (App Router)
- **Authentication:** [Clerk](https://clerk.com/)
- **Database:** [MongoDB](https://www.mongodb.com/)
- **ORM/ODM:** [Mongoose](https://mongoosejs.com/) (or Prisma)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

---

## ⚙️ Getting Started

### 1. Prerequisites
Ensure you have the following installed:
- Node.js (v18.x or later)
- NPM / Yarn / PNPM
- A MongoDB Atlas account
- A Clerk Dashboard account

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/wibu137/blog-kp23.git

# Navigate to the project
cd blog-kp23

# Install dependencies
npm install
```
### 3. Environment Variables
Create a `.env.local` file in the root directory and add your credentials:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_....
CLERK_SECRET_KEY=sk_test_....
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
WEBHOOK_SECRET=...
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaS...
# MongoDB
MONGODB_URI=mongodb...
# URL
URL=http://localhost:3000
```

### 4. Run the Application

```bash
npm run dev
```

Open http://localhost:3000 with your browser to see the result.

---

## 📂 Project Structure

```text
blog-kp23/
├── .next/                 # Build output (auto-generated)
├── node_modules/          # Dependencies (auto-generated)
├── public/                # Static assets
├── src/                   # Main source code
│   ├── app/               # Next.js App Router (pages, layouts, API)
│   ├── lib/               # Utilities & shared logic
│   ├── firebase.js        # Firebase configuration
│   └── middleware.js      # Middleware (auth, routing, etc.)
│
├── .env.local             # Environment variables (ignored by git)
├── .eslintrc.json         # ESLint configuration
├── .gitignore             # Git ignore rules
├── CONTRIBUTING.md        # Contribution guidelines
├── LICENSE                # MIT license
├── jsconfig.json          # Path alias config
├── next.config.mjs        # Next.js configuration
├── package.json           # Project scripts & dependencies
├── package-lock.json      # Lock file
├── postcss.config.mjs     # PostCSS config
├── tailwind.config.js     # Tailwind CSS config
├── README.md              # Documentation
```


---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please read the `CONTRIBUTING.md` file for details on our code of conduct and the process for submitting pull requests.

---

## 📄 License

This project is licensed under the **MIT License**.
See the `LICENSE` file for more information.

---

## 📞 Contact

* GitHub: https://github.com/wibu137/blog-kp23
* Author: **wibu137**

---

💖 Developed with love by **wibu137**
