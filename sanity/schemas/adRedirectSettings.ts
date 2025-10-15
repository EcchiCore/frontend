import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'adRedirectSettings',
  title: 'Ad Redirect Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'shrtflyUrl',
      title: 'ShrtFly Base URL',
      type: 'url',
      initialValue: 'https://shrtfly.com/',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'apiToken',
      title: 'API Token',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'advertMode',
      title: 'Advert Mode',
      type: 'number',
      initialValue: 1,
      description: 'Use values supported by ShrtFly (e.g. 1 for interstitial, 2 for banner).',
    }),
    defineField({
      name: 'includeDomains',
      title: 'Include Domains',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Only apply the script to these domains. Leave empty to target all domains.',
    }),
    defineField({
      name: 'excludeDomains',
      title: 'Exclude Domains',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Domains that should be ignored by the full page script.',
    }),
    defineField({
      name: 'externalScriptLoading',
      title: 'External Script Loading',
      type: 'string',
      options: {
        list: [
          {title: 'defer', value: 'defer'},
          {title: 'async', value: 'async'},
        ],
        layout: 'radio',
      },
      initialValue: 'defer',
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})
