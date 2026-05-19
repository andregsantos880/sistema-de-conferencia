/**
 * File Upload Scenarios
 * 
 * Comprehensive guide to file uploads in Katalyst, covering:
 * - Single vs Multi-file uploads
 * - Image handling (previews, validation)
 * - Document handling
 * - Drag & Drop interactions
 * - Progress tracking & cancellation
 * - Clipboard pasting
 */

import React from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { FileUploadDemo } from './demos';

const FileUploadShowcasePage: React.FC = () => {
  return (
    <ShowcasePage
      title="File Uploads"
      description={<p className="text-sm text-muted-foreground">Production-ready file upload patterns powered by <b>react-dropzone</b>, featuring drag & drop, validation, image previews, and progress tracking.</p>}
    >
      <ShowcaseSection
        title="Comprehensive Upload Demo"
        description="A full-featured example showing both form-based uploads (deferred) and auto-uploads (immediate). Includes image compression, clipboard support, and error handling."
      >
        <CodeExample
          id="file-upload-demo"
          title="Profile & Document Upload"
          description="Complete demonstration of file upload capabilities including profile photos, document lists, and standalone auto-upload zones."
          code={`// Form-based upload (Controlled)
<Controller
  name="profilePhoto"
  control={control}
  render={({ field }) => (
    <FileUploadZone
      accept={{ 'image/*': ['.png', '.jpg'] }}
      maxSize={5 * 1024 * 1024}
      // Files stored in form state, uploaded on submit
      autoUpload={false}
      onFilesChange={field.onChange}
    />
  )}
/>

// Auto-upload (Uncontrolled)
<FileUploadZone
  // Uploads immediately on drop
  autoUpload={true}
  uploadUrl="/api/upload"
  onUploadComplete={(file, result) => {
    console.log('Uploaded:', result.url);
  }}
/>`}
        >
          <FileUploadDemo />
        </CodeExample>
      </ShowcaseSection>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-lg font-semibold mb-3">Key Features</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong>Drag & Drop:</strong> Native drag and drop support with visual feedback</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong>Validation:</strong> Client-side validation for file type, size, and dimensions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong>Image Processing:</strong> Automatic client-side compression and resizing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong>Clipboard Support:</strong> Paste images directly from clipboard (Ctrl+V)</span>
            </li>
          </ul>
        </div>
        
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-lg font-semibold mb-3">Upload Modes</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong>Form-Based:</strong> Files are validated and stored in form state, then uploaded when the user submits the form (transactional).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong>Auto-Upload:</strong> Files upload immediately upon selection, with real-time progress and cancellation.</span>
            </li>
          </ul>
        </div>
      </div>
    </ShowcasePage>
  );
};

export default FileUploadShowcasePage;
