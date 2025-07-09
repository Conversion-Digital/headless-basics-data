import { defineField, defineType } from "sanity"

export const internalUrl = defineField({
    name: "internalUrl",
    title: "Internal URL",
    type: "reference",
    to: [{type: 'page'}],
    description: 'Select an internal page to link to (Optional)'
  })
  
  export  const externalUrl = defineField({
    name: "externalUrl",
    title: "External URL",
    type: 'url',
    description: 'Enter an external URL to link to. (Optional)'
  })
  
  export const media = defineField({
    name: "media",
    title: "Media",
    type: "image",
    options: { hotspot: true },
  })

  export const targetedLink = defineType({
    name: "targetedLink",
    title: "General Link",
    type: "object",
    fields: [
      defineField({
        name: "name",
        title: "Name",
        type: "string",
      }),
      defineField({
        name: "target",
        title: "Target",
        type: "string",
      }),
      defineField({
        name: "type",
        title: "Type",
        type: "string",
      }),
      // Using the previously defined fields for URLs
      internalUrl,
      externalUrl,
    ],
  })
  
  export const linksList = defineField({
    name: "links",
    title: "Links",
    type: "array",
    of: [{ type: "targetedLink" }],
  });

  export const linkItem = defineType({
    name: 'linkItem',
    title: 'Link Item',
    type: 'object',
    fields: [
      defineField({
        name: 'label',
        title: 'Label',
        type: 'string',
        validation: Rule => Rule.required()
      }),
      defineField({
        name: 'url',
        title: 'URL',
        type: 'url'
      })
    ]
  });