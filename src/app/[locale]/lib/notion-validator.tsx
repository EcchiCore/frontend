// lib/notion-validator.ts
import { Client } from '@notionhq/client';

interface RequiredProperty {
  name: string;
  type: string;
  required: boolean;
}

const REQUIRED_PROPERTIES: RequiredProperty[] = [
  { name: 'Title', type: 'title', required: true },
  { name: 'Description', type: 'rich_text', required: true },
  { name: 'Status', type: 'select', required: false },
  { name: 'Category', type: 'select', required: false },
  { name: 'Priority', type: 'select', required: false },
  { name: 'Tags', type: 'multi_select', required: false },
  { name: 'Author', type: 'rich_text', required: false },
  { name: 'DatePosted', type: 'date', required: false },
  { name: 'Responses', type: 'number', required: false },
];

export async function validateDatabaseStructure(databaseId: string, notionToken: string) {
  try {
    const notion = new Client({ auth: notionToken });

    // Get database schema
    const database = await notion.databases.retrieve({ database_id: databaseId });

    const existingProperties = Object.keys(database.properties);
    const missingProperties: string[] = [];
    const propertyTypeIssues: string[] = [];

    console.log('📋 Database Properties Found:', existingProperties);
    console.log('🎯 Required Properties:', REQUIRED_PROPERTIES.map(p => p.name));

    // Check for missing or incorrect properties
    for (const requiredProp of REQUIRED_PROPERTIES) {
      const existingProp = database.properties[requiredProp.name];

      if (!existingProp) {
        if (requiredProp.required) {
          missingProperties.push(`${requiredProp.name} (${requiredProp.type}) - REQUIRED`);
        } else {
          missingProperties.push(`${requiredProp.name} (${requiredProp.type}) - Optional`);
        }
      } else if (existingProp.type !== requiredProp.type) {
        propertyTypeIssues.push(
          `${requiredProp.name}: Expected ${requiredProp.type}, found ${existingProp.type}`
        );
      }
    }

    return {
      isValid: missingProperties.filter(p => p.includes('REQUIRED')).length === 0,
      existingProperties,
      missingProperties,
      propertyTypeIssues,
      database
    };

  } catch (error) {
    console.error('❌ Error validating database:', error);
    throw error;
  }
}

export function logDatabaseValidation(validation: any) {
  console.log('\n🔍 Database Structure Validation:');
  console.log('='.repeat(50));

  if (validation.isValid) {
    console.log('✅ Database structure is valid!');
  } else {
    console.log('❌ Database structure has issues:');
  }

  if (validation.missingProperties.length > 0) {
    console.log('\n📝 Missing Properties:');
    validation.missingProperties.forEach((prop: string) => {
      console.log(`   - ${prop}`);
    });
  }

  if (validation.propertyTypeIssues.length > 0) {
    console.log('\n⚠️  Property Type Issues:');
    validation.propertyTypeIssues.forEach((issue: string) => {
      console.log(`   - ${issue}`);
    });
  }

  console.log('='.repeat(50));
}