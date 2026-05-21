# Guide de Déploiement RedCMS

Ce guide explique comment déployer RedCMS pour un nouveau client.

## Prérequis

- Node.js 18+
- npm ou pnpm
- Compte Supabase
- Hébergement (Vercel, Netlify, ou serveur)

---

## 1. Créer le projet Supabase

### 1.1 Nouveau projet

1. Connectez-vous à [supabase.com](https://supabase.com)
2. Cliquez sur **New Project**
3. Remplissez :
   - **Name** : nom-du-client
   - **Database Password** : générez un mot de passe fort
   - **Region** : choisissez la plus proche du client
4. Cliquez sur **Create new project**

### 1.2 Appliquer le schéma

1. Allez dans **SQL Editor**
2. Copiez le contenu de `supabase/migrations/installation.sql`
3. Exécutez la requête

### 1.3 Configurer le Storage

1. Allez dans **Storage**
2. Créez un bucket nommé `media`
3. Configurez les policies :

```sql
-- Policy pour lecture publique
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Policy pour upload authentifié
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Policy pour suppression authentifiée
CREATE POLICY "Authenticated delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'media' AND auth.role() = 'authenticated');
```

### 1.4 Créer l'utilisateur admin

1. Allez dans **Authentication** > **Users**
2. Cliquez sur **Add user**
3. Entrez l'email et mot de passe du client

### 1.5 Récupérer les clés

1. Allez dans **Settings** > **API**
2. Notez :
   - **Project URL** : `https://xxxx.supabase.co`
   - **anon public key** : `eyJhbGci...`

---

## 2. Configurer le projet

### 2.1 Cloner le repository

```bash
git clone https://github.com/redarrow/redcms.git nom-du-client
cd nom-du-client
```

### 2.2 Installer les dépendances

```bash
npm install
```

### 2.3 Variables d'environnement

Créez le fichier `.env` :

```env
PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 2.4 Configuration du site

Éditez `redcms/core/siteConfig.ts` :

```typescript
export const siteConfig: SiteConfig = {
  siteName: 'Nom du Client',
  siteUrl: 'https://www.client.com',
  defaultLocale: 'fr-FR',
  
  defaultTitle: 'Nom du Client',
  titleTemplate: '%s | Nom du Client',
  defaultDescription: 'Description du site...',
  defaultOgImage: '/og-image.jpg',
  
  favicon: '/favicon.ico',
  
  // SEO Local (optionnel)
  business: {
    name: 'Nom Entreprise',
    type: 'LocalBusiness',
    address: {
      street: '123 Rue Exemple',
      city: 'Paris',
      postalCode: '75001',
      country: 'FR',
    },
    phone: '+33 1 23 45 67 89',
    email: 'contact@client.com',
  },
  
  generateSitemap: true,
  generateRobotsTxt: true,
};
```

### 2.5 Sections activées

Éditez `redcms/config.ts` pour activer/désactiver les sections :

```typescript
export const config: ClientConfig = {
  enabledSections: [
    'hero-principal',
    'hero-slider',
    'texte-image',
    'faq',
    // ... sections souhaitées
  ],
  blogEnabled: true,
  maxVersions: 10,
};
```

---

## 3. Personnalisation

### 3.1 Header et Footer

Éditez `src/layouts/Layout.astro` pour personnaliser le header et footer du site.

### 3.2 Styles globaux

Les styles sont dans le même fichier. Adaptez les couleurs, polices, etc.

### 3.3 Composants de sections

Les sections sont dans `src/sections/`. Personnalisez les styles selon la charte graphique du client.

---

## 4. Build et déploiement

### 4.1 Build de production

```bash
npm run build
```

Le build génère un dossier `dist/` prêt à déployer.

### 4.2 Déploiement Vercel

1. Connectez le repo GitHub à Vercel
2. Configurez les variables d'environnement :
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
3. Déployez

### 4.3 Déploiement Netlify

1. Connectez le repo GitHub à Netlify
2. Build command : `npm run build`
3. Publish directory : `dist`
4. Ajoutez les variables d'environnement
5. Déployez

### 4.4 Déploiement serveur (VPS)

```bash
# Build
npm run build

# Copier dist/ sur le serveur
rsync -avz dist/ user@server:/var/www/client/

# Configurer Nginx
server {
    listen 80;
    server_name www.client.com;
    root /var/www/client;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 5. Vérifications post-déploiement

### Checklist

- [ ] Site accessible publiquement
- [ ] Admin accessible (`/admin`)
- [ ] Connexion admin fonctionnelle
- [ ] Upload de médias fonctionnel
- [ ] Pages publiées visibles
- [ ] SEO : meta tags corrects
- [ ] Sitemap accessible (`/sitemap.xml`)
- [ ] Robots.txt accessible (`/robots.txt`)

### Tests recommandés

1. Créer une page de test avec plusieurs sections
2. Publier et vérifier le rendu
3. Tester sur mobile
4. Vérifier les Core Web Vitals

---

## 6. Maintenance

### Mises à jour RedCMS

1. Dans l'admin, vérifiez les mises à jour disponibles
2. Ou manuellement :

```bash
# Backup
cp -r . ../backup-$(date +%Y%m%d)

# Pull des updates
git pull origin main

# Réinstaller les dépendances
npm install

# Rebuild
npm run build
```

### Backup base de données

Supabase effectue des backups automatiques. Pour un backup manuel :

1. **Supabase Dashboard** > **Database** > **Backups**
2. Ou via pg_dump

### Logs et monitoring

- Logs Supabase : **Dashboard** > **Logs**
- Logs hébergeur : Vercel/Netlify Dashboard

---

## 7. Dépannage

### Problème de connexion admin

1. Vérifiez les variables d'environnement
2. Vérifiez que l'utilisateur existe dans Supabase Auth
3. Vérifiez les policies RLS

### Images ne s'affichent pas

1. Vérifiez que le bucket `media` existe
2. Vérifiez les policies de storage
3. Vérifiez l'URL publique du bucket

### Erreur 500 sur les pages

1. Vérifiez les logs Supabase
2. Vérifiez que les tables existent
3. Vérifiez les policies RLS

---

## Support

Pour toute question technique : support@redarrow.fr

**RedCMS v0.1.0** - Red Arrow
