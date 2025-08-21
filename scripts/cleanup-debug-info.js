#!/usr/bin/env node

/**
 * Script để xóa debug info sau khi đã fix xong lỗi edit document
 */

const fs = require('fs');
const path = require('path');

// Files cần cleanup
const filesToCleanup = [
  {
    path: 'apps/frontend/src/app/features/user/all-documents/all-documents.component.html',
    patterns: [
      {
        search: /      <!-- Debug info -->\s*<div style="background: #f0f0f0; padding: 10px; margin: 10px; border-radius: 5px; font-size: 12px;">\s*<strong>Debug Info:<\/strong><br>\s*documentToEdit: {{ documentToEdit \? 'EXISTS' : 'NULL' }}<br>\s*documentToEdit\.id: {{ documentToEdit\?\.id }}<br>\s*documentToEdit\.title: {{ documentToEdit\?\.title }}\s*<\/div>/s,
        replace: ''
      }
    ]
  },
  {
    path: 'apps/frontend/src/app/features/user/document-form/document-form.component.ts',
    patterns: [
      {
        search: /            <!-- Debug info -->\s*<div style="background: #f0f0f0; padding: 5px; margin-top: 5px; border-radius: 3px; font-size: 11px;">\s*<strong>Debug:<\/strong> isEditMode={{ isEditMode }}, document\.id={{ document\?\.id }}, document\.title={{ document\?\.title }}\s*<\/div>/s,
        replace: ''
      },
      {
        search: /  \/\/ Debug method to log input changes\s*ngOnChanges\(changes: any\): void \{\s*console\.log\('=== DocumentFormComponent ngOnChanges ==='\);\s*console\.log\('Changes:', changes\);\s*if \(changes\.document\) \{\s*console\.log\('Document input changed:', changes\.document\.currentValue\);\s*console\.log\('Document ID:', changes\.document\.currentValue\?\.id\);\s*\}\s*\}/s,
        replace: ''
      },
      {
        search: /  @Output\(\) documentSaved = new EventEmitter<Document>\(\); \/\/ Alias for compatibility\s*/s,
        replace: ''
      },
      {
        search: /          this\.documentSaved\.emit\(updatedDocument\);\s*/s,
        replace: ''
      },
      {
        search: /          this\.documentSaved\.emit\(createdDocument\);\s*/s,
        replace: ''
      },
      {
        search: /    console\.log\('Checking document for edit mode:'\);\s*console\.log\('  - document exists:', \!\!this\.document\);\s*console\.log\('  - document\.id:', this\.document\?\.id\);\s*console\.log\('  - document\.id type:', typeof this\.document\?\.id\);\s*console\.log\('  - document\.id truthy:', \!\!this\.document\?\.id\);\s*/s,
        replace: ''
      },
      {
        search: /      console\.log\('✅ Setting edit mode - document with valid ID provided'\);\s*/s,
        replace: '      console.log(\'✅ Setting edit mode - document with ID provided\');\n'
      },
      {
        search: /    if \(this\.document && this\.document\.id && typeof this\.document\.id === 'number' && this\.document\.id > 0\) \{\s*/s,
        replace: '    if (this.document && this.document.id) {\n'
      },
      {
        search: /    if \(this\.isEditMode && this\.document && this\.document\.id && typeof this\.document\.id === 'number' && this\.document\.id > 0\) \{\s*/s,
        replace: '    if (this.isEditMode && this.document && this.document.id) {\n'
      }
    ]
  },
  {
    path: 'apps/frontend/src/app/features/user/all-documents/all-documents.component.ts',
    patterns: [
      {
        search: /    console\.log\('Document ID type:', typeof document\.id\);\s*/s,
        replace: ''
      },
      {
        search: /    \/\/ Tạo deep copy để đảm bảo không có reference issues\s*this\.documentToEdit = JSON\.parse\(JSON\.stringify\(document\)\);\s*/s,
        replace: '    this.documentToEdit = { ...document }; // Tạo copy để tránh reference issues\n'
      },
      {
        search: /    console\.log\('documentToEdit\.id:', this\.documentToEdit\.id\);\s*console\.log\('documentToEdit\.id type:', typeof this\.documentToEdit\.id\);\s*/s,
        replace: ''
      }
    ]
  },
  {
    path: 'apps/frontend/src/app/core/services/dispatch/documents.service.ts',
    patterns: [
      {
        search: /    console\.log\('=== DocumentsService\.updateDocument ==='\);\s*console\.log\('Update input:', input\);\s*/s,
        replace: ''
      },
      {
        search: /      map\(result => \{\s*console\.log\('Update mutation result:', result\);\s*return result\.data!\.updateDocument\.data;\s*\}\)/s,
        replace: '      map(result => result.data!.updateDocument.data)'
      }
    ]
  },
  {
    path: 'apps/backend/src/modules/dispatch/documents/documents.resolver.ts',
    patterns: [
      {
        search: /    console\.log\('=== updateDocument mutation ==='\);\s*console\.log\('Update input:', updateDocumentInput\);\s*console\.log\('Document ID:', updateDocumentInput\.id\);\s*console\.log\('User:', user\?\.id, user\?\.email\);\s*/s,
        replace: ''
      },
      {
        search: /      console\.log\('Document updated successfully:', document\);\s*/s,
        replace: ''
      },
      {
        search: /      console\.error\('Error updating document:', error\);\s*/s,
        replace: ''
      }
    ]
  },
  {
    path: 'apps/backend/src/modules/dispatch/documents/documents.service.ts',
    patterns: [
      {
        search: /    console\.log\('=== DocumentsService\.update ==='\);\s*console\.log\('ID to update:', id\);\s*console\.log\('Update input:', updateDocumentInput\);\s*/s,
        replace: ''
      },
      {
        search: /    console\.log\('Found entity:', entity\);\s*/s,
        replace: ''
      },
      {
        search: /    if \(!entity\) \{\s*console\.log\('❌ Document not found with ID:', id\);\s*throw new BadRequestException\(`Document with ID \${id} not found`\);\s*\}/s,
        replace: '    if (!entity) {\n      throw new BadRequestException(`Document with ID ${id} not found`);\n    }'
      },
      {
        search: /    console\.log\('Saving updated entity\.\.\.'\);\s*/s,
        replace: ''
      },
      {
        search: /    console\.log\('Saved document:', savedDocument\);\s*/s,
        replace: ''
      },
      {
        search: /    \/\/ Load relations for the updated document\s*console\.log\('Loading document with relations\.\.\.'\);\s*/s,
        replace: '    // Load relations for the updated document\n'
      },
      {
        search: /    console\.log\('Document with relations:', documentWithRelations\);\s*/s,
        replace: ''
      },
      {
        search: /    if \(!documentWithRelations\) \{\s*console\.log\('❌ Failed to load document with relations'\);\s*throw new BadRequestException\('Failed to load document with relations'\);\s*\}/s,
        replace: '    if (!documentWithRelations) {\n      throw new BadRequestException(\'Failed to load document with relations\');\n    }'
      },
      {
        search: /    console\.log\('✅ Returning updated document:', documentWithRelations\);\s*/s,
        replace: ''
      }
    ]
  }
];

function cleanupFile(filePath, patterns) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let hasChanges = false;
    
    patterns.forEach((pattern, index) => {
      const beforeLength = content.length;
      content = content.replace(pattern.search, pattern.replace);
      
      if (content.length !== beforeLength) {
        hasChanges = true;
        console.log(`✅ Applied pattern ${index + 1} to ${filePath}`);
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Cleaned up ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No changes needed for ${filePath}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🧹 Starting debug info cleanup...\n');
  
  let cleanedFiles = 0;
  let totalFiles = filesToCleanup.length;
  
  filesToCleanup.forEach(fileConfig => {
    if (cleanupFile(fileConfig.path, fileConfig.patterns)) {
      cleanedFiles++;
    }
  });
  
  console.log(`\n📊 Cleanup summary:`);
  console.log(`   - Files processed: ${totalFiles}`);
  console.log(`   - Files cleaned: ${cleanedFiles}`);
  console.log(`   - Files unchanged: ${totalFiles - cleanedFiles}`);
  
  if (cleanedFiles > 0) {
    console.log('\n✅ Debug info cleanup completed successfully!');
    console.log('💡 Remember to test the application to ensure everything still works correctly.');
  } else {
    console.log('\nℹ️  No debug info found to clean up.');
  }
}

// Run cleanup
main();
