# ScoutingDrankKas
I created the ScoutingDrankKas as a system to sell and manage drinks effectively, providing a seamless experience for users and barkeepers at my scouting.

I am planning on adding a lot of features to the system, but for now I am focusing on the basics. The system is built with Nuxt 3 and uses a MongoDB database.

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
- **Database**: [MongoDB](https://www.mongodb.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Containerization**: [Docker](https://www.docker.com/)
- **Version Control**: [Git](https://git-scm.com/)

---

## 📦 Installation

1. Clone the repository:

``` bash
git clone https://github.com/robinoosterik2/ScoutingDrankKas.git
```

2. Navigate to the project directory:

``` bash
cd ScoutingDrankKas
```
3. Install dependencies:

``` bash
npm install
```

4. Create a `.env` file in the root directory. For an example look at `.env.example`:

``` bash
cp .env.example .env
```

5. Start the development server:

``` bash
docker compose up --build
```
6. Open your browser and navigate to `http://localhost`.

7. Create a superuser account:
 Sadly this work in progress. At this moment create a user, comment out the middleware checking for admin and add your own admin role :(.
---

## 📂 Project Structure

- `/components`: Reusable Vue components.
- `/layouts`: Layout components for different pages.
- `/pages`: Vue pages for routing.
- `/plugins`: Nuxt plugins for extending functionality.
- `/store`: Vuex store for state management.
- `/middleware`: Middleware for route handling.
- `/assets`: CSS files for styling.
- `/public`: Static files and assets.
- `/server`: Server-side code and API routes.
- `/utils`: Utility functions and helpers.

---

## 👤 Author

Robin Oosterik
- linkedin: [Robin Oosterik](https://www.linkedin.com/in/robin-oosterik/)
---

## 📜 License

This project is licensed under the [MIT License](LICENSE).