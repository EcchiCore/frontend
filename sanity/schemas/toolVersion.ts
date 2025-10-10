import {defineField, defineType} from 'sanity'

export default defineType({
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
})
