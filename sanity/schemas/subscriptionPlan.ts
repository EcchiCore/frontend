import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'subscriptionPlan',
  title: 'Subscription Plan',
  type: 'document',
  fields: [
    defineField({
      name: 'planId',
      title: 'Plan ID',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'pointsCost',
      title: 'Points Cost',
      type: 'number',
      validation: Rule => Rule.required().min(1),
    }),
    defineField({
      name: 'durationDays',
      title: 'Duration (Days)',
      type: 'number',
      validation: Rule => Rule.required().min(1),
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})
