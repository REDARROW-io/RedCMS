/**
 * Schema: Page Produits
 * Définit les champs éditables de la page produits
 */

import { defineSchema } from '@redcms/core/schema';

export default defineSchema({
  slug: 'produits',
  label: 'Produits',
  icon: '🛍️',
  description: 'Catalogue de produits',
  fields: [
    // En-tête
    {
      name: 'titre',
      type: 'text',
      label: 'Titre de la page',
      required: true,
      default: 'Nos Produits',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      placeholder: 'Présentez votre catalogue...',
      default: 'Découvrez notre sélection de produits de qualité',
    },

    // Liste des produits
    {
      name: 'produits',
      type: 'array',
      label: 'Produits',
      itemFields: [
        { name: 'nom', type: 'text', label: 'Nom du produit', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'prix', type: 'text', label: 'Prix', placeholder: '99,00 €' },
        { name: 'prix_barre', type: 'text', label: 'Ancien prix (barré)', placeholder: '129,00 €' },
        { name: 'image', type: 'image', label: 'Image' },
        { name: 'badge', type: 'text', label: 'Badge', placeholder: 'Nouveau, Promo, -20%...' },
        { name: 'en_stock', type: 'boolean', label: 'En stock', default: true },
        { name: 'lien', type: 'url', label: 'Lien (bouton acheter)' },
      ],
    },

    // CTA bas de page
    {
      name: 'cta_titre',
      type: 'text',
      label: 'Titre CTA',
      default: 'Besoin d\'aide pour choisir ?',
    },
    {
      name: 'cta_texte',
      type: 'textarea',
      label: 'Texte CTA',
      default: 'Notre équipe est là pour vous conseiller',
    },
    {
      name: 'cta_bouton',
      type: 'text',
      label: 'Texte du bouton',
      default: 'Nous contacter',
    },
    {
      name: 'cta_lien',
      type: 'url',
      label: 'Lien du bouton',
      default: '/contact',
    },
  ],
});
