# Analyse de Configuration Supabase pour Vercel

## 1. Vérification de l'usage des variables d'environnement

### Variables utilisées dans `lib/supabase.ts`

**Client Frontend (`supabase`)** :
- `NEXT_PUBLIC_SUPABASE_URL` ✅ (ligne 3)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅ (ligne 4)

**Client Backend (`supabaseAdmin`)** :
- `NEXT_PUBLIC_SUPABASE_URL` ✅ (réutilisé)
- `SUPABASE_SERVICE_ROLE_KEY` ✅ (ligne 16) - avec fallback sur `supabaseAnonKey` si absent

### Comportement Next.js App Router

**Variables `NEXT_PUBLIC_*`** :
- ✅ Accessibles côté client (composants `'use client'`)
- ✅ Accessibles côté serveur (API Routes, Server Components)
- ✅ Incluses dans le bundle JavaScript côté client
- ⚠️ **IMPORTANT** : Ces variables sont exposées publiquement dans le code client

**Variables sans préfixe `NEXT_PUBLIC_`** :
- ✅ Accessibles uniquement côté serveur (API Routes)
- ❌ **NON accessibles** côté client
- ✅ Sécurisées (non exposées dans le bundle)

### Problème identifié

Le client Supabase est initialisé au **niveau du module** (`lib/supabase.ts`), ce qui signifie :
- ✅ Fonctionne en développement local avec `.env.local`
- ⚠️ En production Vercel, les variables doivent être configurées dans le dashboard
- ⚠️ Si les variables manquent, l'erreur est levée au build/import, pas à l'exécution

## 2. Vérification du client Supabase côté App Router

### Structure actuelle

```typescript
// lib/supabase.ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
);
```

### Utilisation dans les API Routes

Toutes les API Routes utilisent `supabaseAdmin` :
- `app/api/dashboard/stats/route.ts` ✅
- `app/api/purchases/route.ts` ✅
- `app/api/ingredients/route.ts` ✅
- `app/api/recipes/route.ts` ✅
- `app/api/suppliers/route.ts` ✅

**✅ Configuration correcte** : Les API Routes utilisent le client admin avec privilèges service role.

### Points d'attention

1. **Initialisation au niveau module** : Si les variables manquent, l'erreur survient au build, pas à l'exécution
2. **Fallback sur anon key** : Si `SUPABASE_SERVICE_ROLE_KEY` est absent, le code utilise `supabaseAnonKey` (moins sécurisé mais fonctionnel)
3. **Pas de gestion d'erreur runtime** : Si les variables sont `undefined` au runtime, le client Supabase échouera silencieusement

## 3. Variables d'environnement à définir sur Vercel

### Variables REQUISES pour Production + Preview

#### Production (Production)
```
NEXT_PUBLIC_SUPABASE_URL=https://jqnqngfopmlghqdrvjhw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxbnFuZ2ZvcG1sZ2hxZHJ2amh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NDgxOTEsImV4cCI6MjA4MTAyNDE5MX0.mOueH6JCa8bjEXAfYxGdBUZFJShJJMKKY3OwzWWg75c
SUPABASE_SERVICE_ROLE_KEY=<À_RÉCUPÉRER_DANS_SUPABASE_DASHBOARD>
```

#### Preview (Preview + Development)
```
NEXT_PUBLIC_SUPABASE_URL=https://jqnqngfopmlghqdrvjhw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxbnFuZ2ZvcG1sZ2hxZHJ2amh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NDgxOTEsImV4cCI6MjA4MTAyNDE5MX0.mOueH6JCa8bjEXAfYxGdBUZFJShJJMKKY3OwzWWg75c
SUPABASE_SERVICE_ROLE_KEY=<À_RÉCUPÉRER_DANS_SUPABASE_DASHBOARD>
```

### Variables OPTIONNELLES (pour Azure OCR)

```
AZURE_VISION_ENDPOINT=<votre_endpoint_azure>
AZURE_VISION_KEY=<votre_clé_azure>
```

### Comment ajouter les variables sur Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Sélectionnez votre projet
3. Settings → Environment Variables
4. Pour chaque variable :
   - **Key** : Nom de la variable
   - **Value** : Valeur de la variable
   - **Environment** : Sélectionnez **Production**, **Preview**, et **Development**
5. Cliquez sur **Save**

### ⚠️ IMPORTANT : Récupérer SUPABASE_SERVICE_ROLE_KEY

1. Allez sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet `jqnqngfopmlghqdrvjhw`
3. Settings → API
4. Dans la section "Project API keys"
5. Copiez la **`service_role` key** (⚠️ SECRET - ne jamais exposer côté client)
6. Ajoutez-la comme `SUPABASE_SERVICE_ROLE_KEY` sur Vercel

## 4. Pourquoi Vercel ne crée pas de déploiement Production sans push

### Comportement Vercel par défaut

Vercel crée des déploiements **Production** uniquement lorsque :
1. ✅ Un push est effectué sur la **branche principale** (généralement `main` ou `master`)
2. ✅ La branche principale est configurée dans les **Project Settings → Git → Production Branch**

### Déploiements automatiques

- **Production** : Push sur `main`/`master` (branche configurée)
- **Preview** : Push sur toute autre branche ou Pull Request
- **Development** : Branches de développement (si activé)

### Configuration actuelle

Vérifiez dans Vercel Dashboard :
1. Settings → Git → **Production Branch**
2. Assurez-vous que c'est `master` ou `main` (selon votre repo)

### Solutions

**Option 1 : Push sur la branche principale**
```bash
git checkout master  # ou main
git push origin master
```

**Option 2 : Forcer un déploiement Production**
1. Vercel Dashboard → Deployments
2. Cliquez sur un déploiement Preview
3. Menu "..." → **Promote to Production**

**Option 3 : Changer la branche de production**
1. Vercel Dashboard → Settings → Git
2. Changez **Production Branch** vers votre branche actuelle

## 5. Problèmes potentiels et solutions

### Problème 1 : Variables non chargées au build

**Symptôme** : Build Vercel échoue avec "Missing Supabase environment variables"

**Solution** : Vérifier que toutes les variables `NEXT_PUBLIC_*` sont définies dans Vercel Dashboard

### Problème 2 : Supabase accessible en local mais pas sur Vercel

**Causes possibles** :
1. Variables non définies sur Vercel
2. Variables définies uniquement pour Production, pas pour Preview
3. Cache de build Vercel avec anciennes valeurs

**Solutions** :
1. Vérifier toutes les variables dans Vercel Dashboard
2. Redéployer après avoir ajouté les variables
3. Vider le cache : Settings → General → Clear Build Cache

### Problème 3 : Erreurs CORS ou authentification

**Cause** : `SUPABASE_SERVICE_ROLE_KEY` manquant ou incorrect

**Solution** : Vérifier que la clé service role est correcte et définie sur Vercel

## 6. Checklist de déploiement

- [ ] Variables définies sur Vercel (Production + Preview)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configuré
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configuré
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configuré (récupéré depuis Supabase Dashboard)
- [ ] Branche principale configurée dans Vercel
- [ ] Push effectué sur la branche principale
- [ ] Build Vercel réussi
- [ ] Test de connexion Supabase sur le déploiement

## 7. Commandes utiles

### Vérifier les variables localement
```bash
# Vérifier que .env.local existe
cat .env.local

# Tester la connexion Supabase
npm run dev
# Ouvrir http://localhost:3000 et vérifier la console
```

### Vérifier les variables sur Vercel
```bash
# Via Vercel CLI
vercel env ls

# Ou via Dashboard
# Settings → Environment Variables
```

