# Section Visibility System

## Overview

RedCMS provides a responsive visibility system that allows hiding/showing fields on specific viewports (desktop, tablet, mobile) through the admin panel.

## How It Works

1. **Admin Panel**: Users toggle visibility per field using the eye icons (Desktop/Tablet/Mobile)
2. **Data Storage**: Visibility settings are stored in `section.data._visibility`
3. **CSS Injection**: `[...slug].astro` generates CSS rules targeting `[data-section-id][data-field]` selectors
4. **Field Wrapper**: Section components use `<Field>` component to add `data-field` attributes

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  [...slug].astro                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ generateVisibilityCSS(sections)                          │   │
│  │ → Generates @media rules for each field with visibility  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                  │
│  <style>                                                        │
│    @media (max-width: 767px) {                                 │
│      [data-section-id="xxx"] [data-field="titre"] {            │
│        display: none !important;                                │
│      }                                                          │
│    }                                                            │
│  </style>                                                       │
│                              ↓                                  │
│  <div data-section-id="section-123">                           │
│    <SectionComponent />                                         │
│  </div>                                                         │
└─────────────────────────────────────────────────────────────────┘
```

## Using the `<Field>` Component

All editable fields in section components should be wrapped with `<Field>`:

```astro
---
import Field from '@/components/Field.astro';

interface Props {
  titre: string;
  description?: string;
  image?: string;
}

const { titre, description, image } = Astro.props;
---

<section class="my-section">
  <Field name="titre" tag="h1" class="title">{titre}</Field>
  
  {description && (
    <Field name="description" tag="p" class="desc">{description}</Field>
  )}
  
  {image && (
    <Field name="image" class="image-wrapper">
      <img src={image} alt="" />
    </Field>
  )}
</section>
```

## `<Field>` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | required | Field name (must match schema) |
| `tag` | `string` | `'div'` | HTML element to render |
| `class` | `string` | `''` | CSS classes |
| `...rest` | any | - | Additional HTML attributes |

### Supported Tags

`div`, `span`, `p`, `h1`-`h6`, `section`, `article`, `aside`, `header`, `footer`, `a`, `button`, `li`

## Visibility Data Structure

```typescript
section.data._visibility = {
  titre: { desktop: true, tablet: true, mobile: false },
  description: { desktop: true, tablet: false, mobile: false },
  image: { desktop: true, tablet: true, mobile: true }
};
```

- `true` or `undefined` = visible
- `false` = hidden

## Breakpoints

| Viewport | CSS Media Query |
|----------|-----------------|
| Desktop | `min-width: 1025px` |
| Tablet | `min-width: 768px and max-width: 1024px` |
| Mobile | `max-width: 767px` |

## Migration Guide

To add visibility support to an existing section:

1. Import Field component:
   ```astro
   import Field from '@/components/Field.astro';
   ```

2. Wrap editable elements with `<Field>`:
   ```astro
   // Before
   <h1 class="title">{titre}</h1>
   
   // After
   <Field name="titre" tag="h1" class="title">{titre}</Field>
   ```

3. Field name must match the field name in `registry.ts`

## Files

- `/src/components/Field.astro` - Reusable field wrapper
- `/src/pages/[...slug].astro` - CSS injection logic
- `/src/utils/visibility.ts` - Utility functions
- `/redcms/admin/pages/[id]/PageEditor.tsx` - Admin visibility controls
