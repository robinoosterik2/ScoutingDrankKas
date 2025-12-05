# ScoutingDrankKas

I created the ScoutingDrankKas as a system to sell and manage drinks effectively, providing a seamless experience for users and barkeepers at my scouting.

I am planning on adding a lot of features to the system, but for now I am focusing on the basics. The system is built with Nuxt 3 and now runs on Prisma with a SQLite database by default.

It is maintained but not my main focus as I am rounding up my studies. I am open to contributions and suggestions for improvements.

---

## 🚀 Features

- **User Management**: Registration, authentication, and role-based access control.
- **Product Management**: Add, edit, and manage products with stock tracking.
- **Order Management**: Efficiently handle orders and track sales.
- **Stock Management**: Monitor and update product stock levels.
- **Logging and Monitoring**: Track user actions and system events.
- **Role Management**: Assign and manage custom roles with permissions.
- **Dark Mode Support**: User-friendly interface with light and dark themes.
- **Localization**: Multi-language support with i18n.

---

## 🛠️ Tech Stack

- **Full-Stack Framework**: [Nuxt 3](https://nuxtjs.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database (dev default)**: [SQLite](https://www.sqlite.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Containerization**: [Docker](https://www.docker.com/)
- **Version Control**: [Git](https://git-scm.com/)

---

## 📦 Installation

1. Clone the repository:

```bash
git clone https://github.com/robinoosterik2/ScoutingDrankKas.git
```

2. Navigate to the project directory:

```bash
cd ScoutingDrankKas
```

3. Install dependencies:

```bash
pnpm install
```

4. Create a `.env` file in the root directory. For an example look at `.env.example`:

```bash
cp .env.example .env
```

5. Start the development server:

```bash
docker compose up --build
```

6. Open your browser and navigate to `http://localhost`.

7. Create a superuser account:
   Sadly this work in progress. At this moment create a user, comment out the middleware checking for admin and add your own admin role :(.

> **Note**  
> You can also run the app directly without Docker by executing `pnpm prisma generate && pnpm prisma db push` followed by `pnpm run dev` inside `app/`.

---

## 📂 Project Structure

- `/app`: Nuxt 3 frontend and server routes.
  - `/components`: Reusable Vue components.
  - `/layouts`: Layout components for different pages.
  - `/pages`: Vue pages for routing.
  - `/middleware`: Route guards and navigation logic.
  - `/prisma`: Prisma schema and migrations for the SQLite database.
  - `/server`: Nitro server routes, middleware, and utilities.
  - `/utils`: Shared helpers and composables.
- `/docker-compose.yml`: Development container configuration.
- `/render.yaml`: Deployment configuration for Render.com.

---

## 🤝 Contributing

Contributions are welcome and greatly appreciated! To contribute to this project, please follow these steps:

1. **Fork the Repository**:

Click the "Fork" button at the top of this repository to create your own copy.

2. **Clone Your Fork**:

Clone your forked repository to your local machine:

```bash
git clone https://github.com/your-username/ScoutingDrankKas.git
cd ScoutingDrankKas
```

3. **Create a Branch**:

```bash
git checkout -b feature-name
```

4. **Make Changes**:
   Implement your feature or fix a bug. Ensure that your code follows the project's coding standards and conventions.

5. **Test Your Changes**:
   (TODO add tests) Ensure that your changes work as expected and do not introduce any new issues.
6. **Commit Your Changes**:

```bash
git commit -m "feature-name: Brief description of changes"
```

7. **Push to Your Fork**:

```bash
git push origin feature-name
```

8. **Create a Pull Request**:
   Go to the original repository and click on the "Pull Requests" tab. Click the "New Pull Request" button and select your branch. Provide a clear description of your changes and submit the pull request.

---

## 👤 Author

Robin Oosterik

- linkedin: [Robin Oosterik](https://www.linkedin.com/in/robin-oosterik/)

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
