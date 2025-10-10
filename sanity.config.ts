import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './sanity/schemas'

export default defineConfig({
  basePath: '/studio',
  projectId: '7cmm88by',
  dataset: 'production',
  apiVersion: '2024-07-18',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
