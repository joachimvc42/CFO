# Banana - Gestion Intelligente de Restaurant 

Banana est une application web moderne de gestion de restaurant avec OCR automatique de factures, gestion des achats, ingrédients, recettes et dashboard financier.

## Stack Technologique

- **Frontend**: Next.js 14 (App Router) + React + TypeScript
- **Styling**: TailwindCSS + Lucide Icons
- **Backend**: Next.js API Routes (Serverless)
- **Base de données**: Supabase (PostgreSQL)
- **OCR**: Azure Computer Vision API
- **Déploiement**: Vercel
- **Authentification**: Supabase Auth (optionnel)

## Fonctionnalités

### OCR Factures

- Upload de factures (PDF, JPG, PNG)
- Extraction automatique via Azure Computer Vision
- Détection : fournisseur, date, TVA, produits, quantités, montants
- Interface d'édition avant validation
- Historique des factures traitées

### Gestion des Achats

- Visualisation de tous les achats
- Ajout manuel ou via OCR
- Liaison aux fournisseurs et produits
- Filtres et recherche avancée
- Export des données

### Gestion des Ingrédients

- Liste complète avec quantités en stock
- Coûts unitaires et fournisseurs
- CRUD complet (Créer, Lire, Modifier, Supprimer)
- Alertes de stock bas

### Recettes

- Catalogue de recettes avec images
- Liste d'ingrédients et proportions
- Calcul automatique du coût basé sur les prix des ingrédients
- Instructions de préparation
- Nombre de portions

### Dashboard Financier

- Montant total des achats (période personnalisable)
- Évolution mensuelle avec graphiques
- Alertes de dépassement budgétaire
- Coût moyen des recettes
- Statistiques fournisseurs

## Installation

### Prérequis

- Node.js 18+
- Un compte [Supabase](https://supabase.com)
- Un compte [Azure](https://azure.microsoft.com) avec Computer Vision API activée
- Git

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/banana-restaurant.git
cd banana-restaurant
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_publique_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role

# Azure Computer Vision
AZURE_VISION_ENDPOINT=https://votre-region.cognitiveservices.azure.com/
AZURE_VISION_KEY=votre_cle_azure_vision

# Optionnel - Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configuration Supabase

#### A. Créer un nouveau projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL et les clés API

#### B. Créer la structure de base de données

Dans l'éditeur SQL de Supabase (onglet "SQL Editor"), exécutez :

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table Suppliers (Fournisseurs)
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  contact TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table Ingredients
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  quantity NUMERIC DEFAULT 0,
  unit TEXT NOT NULL, -- kg, L, unités, etc.
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  category TEXT, -- légumes, viandes, épices, etc.
  min_stock NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table Purchases (Achats)
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  invoice_number TEXT,
  invoice_date DATE NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  vat_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, validated, archived
  ocr_data JSONB, -- Données brutes de l'OCR
  invoice_file_url TEXT, -- URL du fichier uploadé
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table Purchase Items (Lignes d'achat)
CREATE TABLE purchase_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  unit_price NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table Recipes (Recettes)
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  servings INTEGER NOT NULL DEFAULT 4,
  prep_time INTEGER, -- en minutes
  cook_time INTEGER, -- en minutes
  instructions TEXT,
  image_url TEXT,
  category TEXT, -- entrée, plat, dessert
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table Recipe Ingredients (Ingrédients des recettes)
CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes pour performance
CREATE INDEX idx_purchases_date ON purchases(invoice_date DESC);
CREATE INDEX idx_purchases_supplier ON purchases(supplier_id);
CREATE INDEX idx_ingredients_supplier ON ingredients(supplier_id);
CREATE INDEX idx_purchase_items_purchase ON purchase_items(purchase_id);
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);

-- Vue pour le coût des recettes
CREATE OR REPLACE VIEW recipe_costs AS
SELECT
  r.id as recipe_id,
  r.name as recipe_name,
  r.servings,
  SUM(ri.quantity * i.unit_cost) as total_cost,
  SUM(ri.quantity * i.unit_cost) / r.servings as cost_per_serving
FROM recipes r
LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
LEFT JOIN ingredients i ON ri.ingredient_id = i.id
GROUP BY r.id, r.name, r.servings;

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### C. Configurer Row Level Security (RLS) - Optionnel

Si vous activez l'authentification, configurez les politiques RLS dans Supabase.

### 5. Configuration Azure Computer Vision

1. Allez sur [portal.azure.com](https://portal.azure.com)
2. Créez une ressource Computer Vision
3. Choisissez votre région (ex: France Central)
4. Sélectionnez le plan tarifaire (F0 gratuit pour tester)
5. Récupérez :
   - **Endpoint** : `https://votre-region.cognitiveservices.azure.com/`
   - **Key** : Dans "Keys and Endpoint"

### 6. Lancer en développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Déploiement sur Vercel

### Méthode 1 : Via GitHub (Recommandé)

1. Pushez votre code sur GitHub :
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Allez sur [vercel.com](https://vercel.com)
3. Cliquez sur "New Project"
4. Importez votre repo GitHub
5. Ajoutez les variables d'environnement :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AZURE_VISION_ENDPOINT`
   - `AZURE_VISION_KEY`
6. Cliquez sur "Deploy"

### Méthode 2 : Via CLI Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Ajouter les variables d'environnement
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... etc pour toutes les variables

# Déployer en production
vercel --prod
```

## Structure du Projet

```
banana/
├── app/
│   ├── layout.tsx              # Layout principal avec navigation
│   ├── page.tsx                # Dashboard (page d'accueil)
│   ├── globals.css             # Styles globaux + TailwindCSS
│   ├── ocr/
│   │   └── page.tsx            # Page OCR factures
│   ├── purchases/
│   │   ├── page.tsx            # Liste des achats
│   │   └── [id]/page.tsx       # Détail d'un achat
│   ├── ingredients/
│   │   ├── page.tsx            # Liste des ingrédients
│   │   └── [id]/page.tsx       # Détail d'un ingrédient
│   ├── recipes/
│   │   ├── page.tsx            # Liste des recettes
│   │   └── [id]/page.tsx       # Détail d'une recette
│   └── api/
│       ├── ocr/
│       │   └── route.ts        # Endpoint OCR Azure
│       ├── purchases/
│       │   ├── route.ts        # GET all, POST create
│       │   └── [id]/route.ts   # GET, PUT, DELETE
│       ├── ingredients/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── recipes/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       └── dashboard/
│           └── stats/
│               └── route.ts    # Statistiques dashboard
├── components/
│   ├── ui/
│   │   ├── Header.tsx          # En-tête avec logo et navigation
│   │   ├── Navigation.tsx     # Onglets de navigation
│   │   ├── StatCard.tsx       # Carte de statistique
│   │   └── LoadingSpinner.tsx # Indicateur de chargement
│   ├── ocr/
│   │   ├── InvoiceUploader.tsx    # Upload de facture
│   │   └── OCRResultEditor.tsx    # Éditeur de résultat OCR
│   ├── purchases/
│   │   ├── PurchaseTable.tsx   # Tableau des achats
│   │   └── PurchaseForm.tsx    # Formulaire d'achat
│   └── ingredients/
│       ├── IngredientCard.tsx  # Carte d'ingrédient
│       ├── IngredientList.tsx  # Liste d'ingrédients
│       └── IngredientForm.tsx # Formulaire d'ingrédient
├── lib/
│   └── supabase.ts            # Client Supabase
├── types/
│   └── index.ts               # Types TypeScript
└── public/                    # Assets statiques
```

## Utilisation

### 1. Scanner une facture

1. Allez dans l'onglet **OCR Factures**
2. Cliquez sur "Choisir un fichier"
3. Sélectionnez une facture (PDF, JPG, PNG)
4. L'OCR extrait automatiquement les données
5. Vérifiez et éditez si nécessaire
6. Cliquez sur "Valider" pour enregistrer

### 2. Ajouter un achat manuellement

1. Allez dans **Achats**
2. Cliquez sur "Nouvel Achat"
3. Remplissez le formulaire :
   - Fournisseur
   - Date
   - Produits et quantités
   - Montants
4. Enregistrez

### 3. Gérer les ingrédients

1. Allez dans **Ingrédients**
2. Ajoutez un nouvel ingrédient avec :
   - Nom
   - Quantité en stock
   - Coût unitaire
   - Fournisseur associé
3. Modifiez les quantités après chaque achat

### 4. Créer une recette

1. Allez dans **Recettes**
2. Cliquez sur "Nouvelle Recette"
3. Remplissez :
   - Nom et description
   - Nombre de portions
   - Liste des ingrédients avec quantités
4. Le coût total est calculé automatiquement
5. Ajoutez les instructions de préparation

### 5. Consulter le dashboard

Le Dashboard affiche :
- Total des achats (mensuel/annuel)
- Graphique d'évolution
- Coût moyen des recettes
- Alertes de dépassement

## Sécurité

### Variables d'environnement

- Ne jamais commit le fichier `.env.local`
- Utilisez `.env.example` comme modèle
- Sur Vercel, ajoutez les variables dans les paramètres du projet

### Supabase RLS

Si vous activez l'authentification :
- Configurez les Row Level Security policies
- Limitez l'accès par utilisateur/rôle
- Utilisez `SUPABASE_SERVICE_RO_KEY` uniquement côté serveur

### Azure OCR

- La clé Azure doit rester côté serveur (API routes)
- Ne jamais exposer `AZURE_VISION_KEY` au frontend

## Dépannage

### Erreur de connexion Supabase

**Error**: `Invalid Supabase URL or Key`

**Solution** :
- Vérifiez `.env.local`
- Assurez-vous que l'URL se termine par `.supabase.co`
- Redémarrez le serveur de dev: `npm run dev`

### Erreur Azure OCR 401

**Error**: `Unauthorized - Azure Vision API`

**Solution** :
- Vérifiez `AZURE_VISION_KEY` et `AZURE_VISION_ENDPOINT`
- Assurez-vous que la ressource Azure est active
- Vérifiez la région de l'endpoint

### Échec du build Vercel

**Solution** :
- Vérifiez que toutes les variables d'environnement sont ajoutées
- Assurez-vous que `package.json` contient toutes les dépendances
- Regardez les logs de build pour les erreurs spécifiques

## Améliorations Futures

- [ ] Export Excel/PDF des rapports
- [ ] Notifications par email (alertes stock)
- [ ] Application mobile (React Native)
- [ ] Multi-restaurant (gestion centralisée)
- [ ] Intégration comptabilité (API)
- [ ] Prévisions IA (achats optimisés)
- [ ] Gestion du personnel et planning

## Contribution

Les contributions sont les bienvenues !

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Pushez (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Auteur

**Votre Nom**
- GitHub: @votre-username
- Email: votre.email@example.com

## Remerciements

- [Next.js](https://nextjs.org) - Framework React
- [Supabase](https://supabase.com) - Backend as a Service
- [Azure Computer Vision](https://azure.microsoft.com/services/cognitive-services/computer-vision/) - OCR API
- [TailwindCSS](https://tailwindcss.com) - Framework CSS
- [Lucide Icons](https://lucide.dev) - Icônes

## Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la [documentation Supabase](https://supabase.com/docs)
- Consultez la [documentation Azure OCR](https://docs.microsoft.com/azure/cognitive-services/computer-vision/)

---

**Bon appétit et bonne gestion avec Banana !** 🍌

