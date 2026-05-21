/**
 * Schema: Page d'Accueil
 */

import { defineSchema } from '@redcms/core/schema';

export default defineSchema({
  slug: 'accueil',
  label: 'Accueil',
  icon: '🏠',
  description: 'Page d\'accueil du site',
  fields: [
    // === HERO ===
    {
      name: 'hero_surtitre',
      type: 'text',
      label: 'Surtitre Hero',
      default: 'Bienvenue',
    },
    {
      name: 'hero_titre',
      type: 'text',
      label: 'Titre Hero',
      required: true,
      default: 'Votre site avec RedCMS',
    },
    {
      name: 'hero_description',
      type: 'textarea',
      label: 'Description Hero',
      default: 'Un CMS moderne et simple pour gérer votre contenu',
    },
    {
      name: 'hero_image',
      type: 'image',
      label: 'Image de fond Hero',
      default: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
    },
    {
      name: 'hero_bouton_texte',
      type: 'text',
      label: 'Texte du bouton Hero',
      default: 'Découvrir',
    },
    {
      name: 'hero_bouton_lien',
      type: 'url',
      label: 'Lien du bouton Hero',
      default: '#services',
    },

    // === FEATURES ===
    {
      name: 'features',
      type: 'array',
      label: 'Fonctionnalités (Cards)',
      default: [
        {
          titre: 'Simple & Intuitif',
          description: 'Une interface claire pour gérer votre contenu sans effort',
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
        },
        {
          titre: 'Ultra Rapide',
          description: 'Performances optimales avec Astro et génération statique',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
        },
        {
          titre: 'Flexible',
          description: 'Adaptez chaque page selon vos besoins spécifiques',
          image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&q=80',
        },
        {
          titre: 'Sécurisé',
          description: 'Vos données sont protégées avec Supabase',
          image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80',
        },
      ],
      itemFields: [
        { name: 'titre', type: 'text', label: 'Titre', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'image', type: 'image', label: 'Image' },
      ],
    },

    // === SERVICES ===
    {
      name: 'services_titre',
      type: 'text',
      label: 'Titre section Services',
      default: 'Nos Services',
    },
    {
      name: 'services',
      type: 'array',
      label: 'Services',
      default: [
        {
          nom: 'Design Moderne',
          description: 'Des interfaces élégantes et intuitives',
          image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
          lien: '/contact',
        },
        {
          nom: 'Performance',
          description: 'Sites ultra-rapides optimisés pour le SEO',
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
          lien: '/contact',
        },
        {
          nom: 'Support',
          description: 'Accompagnement personnalisé et réactif',
          image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80',
          lien: '/contact',
        },
      ],
      itemFields: [
        { name: 'nom', type: 'text', label: 'Nom du service', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'image', type: 'image', label: 'Image' },
        { name: 'lien', type: 'url', label: 'Lien', placeholder: '/contact' },
      ],
    },

    // === TÉMOIGNAGES ===
    {
      name: 'temoignages_titre',
      type: 'text',
      label: 'Titre section Témoignages',
      default: 'Ce que disent nos clients',
    },
    {
      name: 'temoignages',
      type: 'array',
      label: 'Témoignages',
      default: [
        {
          nom: 'Marie Dupont',
          texte: 'RedCMS a transformé notre façon de gérer le contenu. Simple et efficace !',
          photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
          note: 5,
        },
        {
          nom: 'Pierre Martin',
          texte: 'Excellent CMS, notre équipe l\'a adopté en quelques heures seulement.',
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
          note: 5,
        },
        {
          nom: 'Sophie Bernard',
          texte: 'La flexibilité de RedCMS nous permet de créer exactement ce dont nous avons besoin.',
          photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
          note: 4,
        },
      ],
      itemFields: [
        { name: 'nom', type: 'text', label: 'Nom', required: true },
        { name: 'texte', type: 'textarea', label: 'Témoignage', required: true },
        { name: 'photo', type: 'image', label: 'Photo' },
        { name: 'note', type: 'number', label: 'Note (1-5)', min: 1, max: 5, default: 5 },
      ],
    },
  ],
});
