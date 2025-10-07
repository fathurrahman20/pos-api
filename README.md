# Express.js + TypeScript Starter Template 🚀

[](https://opensource.org/licenses/MIT)
[](https://www.google.com/search?q=https://badge.fury.io/js/%2540coreui%252Fcoreui)

A starter template for building REST APIs using **Express.js** and **TypeScript**.

---

## 🏁 Getting Started

### Prerequisites

Make sure you have **Node.js** (version 22 or higher recommended) and **npm** installed on your machine.

### Installation

1.  **Clone this repository:**

    ```bash
    git clone https://github.com/fathurrahman20/express-typescript.git
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd express-typescript
    ```

3.  **Install all dependencies:**

    ```bash
    npm install
    ```

---

## ⚙️ Environment Configuration

This project uses environment variables to store important configurations.

1.  Create a `.env` file in the root directory by copying the example file:

    ```bash
    cp .env.example .env
    ```

2.  Open the `.env` file and modify the values as needed.

    ```env
    # The port the server will run on
    PORT=3000
    ```

---

## 📜 Available Scripts

You can run the following commands from your terminal:

- **Run the development server (with hot-reload)**

  ```bash
  npm run dev
  ```

  The server will automatically restart whenever you make changes to the code.

- **Build the project for production**

  ```bash
  npm run build
  ```

  This command compiles the TypeScript code (from the `src` folder) into JavaScript in the `dist` directory.

- **Run the production server from the build output**

  ```bash
  npm start
  ```

  Ensure you have already run `npm run build` before executing this command.

---
