# Linkuup Medical - Next.js

Application de gestion des rendez-vous médicaux et commerciaux, réécrite en **Next.js** avec backend et frontend unifiés.

## Stack technique

- **Framework** : Next.js 16 (App Router)
- **Base de données** : MongoDB + Mongoose
- **Auth** : JWT (access + refresh token)
- **État** : Redux Toolkit + TanStack React Query
- **UI** : Tailwind CSS
- **Validation** : Zod + React Hook Form

## Structure du projet

```
linkuup-nextjs/
├── src/
│   ├── app/
│   │   ├── (app)/              # Pages protégées (layout commun)
│   │   │   ├── page.tsx        # Accueil (mes RDV)
│   │   │   ├── admin/          # Administration
│   │   │   ├── manager/        # Tableau de bord manager
│   │   │   ├── users/          # Gestion utilisateurs
│   │   │   ├── appointments/   # Édition RDV
│   │   │   ├── about/
│   │   │   └── unauthorized/
│   │   ├── api/                # API Routes (backend intégré)
│   │   │   ├── auth/           # signin, refreshtoken, logout
│   │   │   ├── users/          # CRUD utilisateurs
│   │   │   └── appointments/   # CRUD rendez-vous
│   │   └── auth/signin/        # Page de connexion
│   ├── components/
│   ├── lib/
│   │   ├── api/                # Clients API
│   │   ├── hooks/              # React Query hooks
│   │   ├── models/             # Modèles Mongoose
│   │   ├── store/              # Redux
│   │   └── utils/
│   └── middleware.ts
```

## Démarrage

### 1. Variables d'environnement

Copiez `.env.example` vers `.env` et configurez :

```env
MONGO_URL=mongodb://localhost:27017/linkuup
JWT_SECRET=votre-secret-jwt
COOKIE_SECRET=votre-secret-cookie
NEXT_PUBLIC_ENCRYPTION_KEY=cle-chiffrement-client
```

### 2. Base de données

- Démarrez MongoDB localement ou utilisez MongoDB Atlas
- Les rôles (user, moderator, admin) sont créés automatiquement au premier signin

### 3. Lancer l'application

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

### 4. Premier utilisateur

Exécutez le script de seed pour créer un admin :

```bash
npm run seed
```

Identifiants : `admin@linkuup.com` / `admin123`

## Rôles et permissions

| Rôle       | Accès                                      |
|------------|--------------------------------------------|
| user       | Mes rendez-vous, création RDV              |
| moderator  | + Manager (vue semaine), édition RDV        |
| admin      | + Administration, utilisateurs, suppression |

## Scripts

- `npm run dev` - Développement
- `npm run build` - Build production
- `npm run start` - Démarrer en production
