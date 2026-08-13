# House of Varsh - Ultra Premium Women's Fashion Platform

Welcome to the **House of Varsh** codebase. This repository contains both the React frontend and the Node.js (Express) backend for the ultra-premium women's fashion eCommerce platform.

## Overview
- **Frontend Framework**: [React](https://reactjs.org/) powered by [Vite](https://vitejs.dev/)
- **Backend Framework**: Node.js & Express (`server.cjs`)
- **Database**: SQLite (`chinni.db`)
- **Styling**: Vanilla CSS with Framer Motion for animations
- **Authentication**: JWT & Google OAuth

---

## Prerequisites
Before you start, make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/download/) (v16.0.0 or higher recommended)
- [Git](https://git-scm.com/)

---

## 🚀 How to Clone & Setup

### 1. Clone the Repository
Clone the project to your local machine:
```bash
git clone <repository-url>
cd chinni
```

### 2. Install Dependencies
Since this repository acts as a unified workspace for both frontend and backend packages (sharing the same `package.json`), you only need to run the install command once in the root folder:

```bash
npm install
```

### 3. Environment Variables
You must set up your environment variables for Google OAuth and JWT to function correctly. 

Create a `.env` file in the root directory (if one doesn't exist already) and add the following keys:
```env
# Example .env Configuration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_secure_jwt_secret_key
```

---

## 💻 Running the Application (Local Development)

To run the full application locally, you must run both the backend server and the frontend dev server simultaneously in separate terminal windows.

### Terminal 1: Run the Backend Server
The backend relies on the `server.cjs` file and natively runs on `http://localhost:5001`.

```bash
# Ensure you are in the root directory
node server.cjs
```
> **Success Message:** You should see `Backend running on port 5001` indicating the API is up. The database connection to `chinni.db` will also be initialized.

### Terminal 2: Run the Frontend Server
The frontend runs via Vite on `http://localhost:5173`. We have configured a Vite proxy so that API requests automatically route to port `5001`.

```bash
# In a new terminal window at the root directory
npm run dev
```
> **Success Message:** You will see a localized link like `http://localhost:5173/`. Open this in your browser to view the House of Varsh website.

---

## Folder Structure
```text
chinni/
├── src/                # Frontend React Components & Assets
├── public/             # Static Assets Configured via Vite
├── uploads/            # Admin Panel UI Managed Image Uploads 
├── server.cjs          # Core Express Backend API
├── .env                # Secret Environment Variables
├── package.json        # Frontend & Node Dependencies list
├── vite.config.ts      # Vite Setup & API Proxy Config
└── chinni.db           # SQLite Database
```
*(Note: There is also an experimental/legacy python implementation located in `django_backend` but `server.cjs` is currently the primary application backend)*

---

## Features included
- **Admin Management Panel**: A dynamic CMS for editing the site text (`site_content`) and layouts.
- **Image Upload System**: File uploading via `multer`.
- **E-Commerce Flows**: New arrivals, trending catalog, and a highly interactive slider UI.
- **Google OAuth**: Integrated authentication pipeline to register VIP customers.
