import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'tool',
  title: 'Tool',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Name of the Lucide icon (e.g., Globe, Download)',
    }),
    defineField({
      name: 'os',
      title: 'Operating Systems',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Windows', value: 'Windows'},
          {title: 'macOS', value: 'macOS'},
          {title: 'Linux', value: 'Linux'},
          {title: 'Android', value: 'Android'},
          {title: 'iOS', value: 'iOS'},
          {title: 'Web', value: 'Web'},
        ],
      },
    }),
    defineField({
      name: 'pricing',
      title: 'Pricing',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Free', value: 'free'},
          {title: 'Paid', value: 'paid'},
        ],
      },
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
    }),
    defineField({
      name: 'publisher',
      title: 'Publisher',
      type: 'string',
    }),
    defineField({
      name: 'isOfficial',
      title: 'Is Official',
      type: 'boolean',
    }),
    defineField({
      name: 'versions',
      title: 'Versions',
      type: 'array',
      of: [
        {
          name: 'toolVersion',
          title: 'Tool Version',
          type: 'object',
          fields: [
            defineField({
              name: 'versionNumber',
              title: 'Version Number',
              type: 'string',
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'releaseDate',
              title: 'Release Date',
              type: 'date',
              options: {
                dateFormat: 'YYYY-MM-DD',
              },
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'changelog',
              title: 'Changelog',
              type: 'text',
            }),
            defineField({
              name: 'downloadLink',
              title: 'Download Link',
              type: 'url',
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'exampleClip',
              title: 'Example Clip (YouTube URL)',
              type: 'url',
            }),
          ],
          preview: {
            select: {
              title: 'versionNumber',
              subtitle: 'releaseDate',
            },
          },
        },
      ],
    }),
  ],
})