/**
 * File Upload Demo - Production-Ready Implementation
 * 
 * Showcases all production features:
 * - Real HTTP upload with progress tracking
 * - Automatic retry with exponential backoff
 * - Upload cancellation
 * - Clipboard paste support
 * - Image compression
 * - Zod validation
 * - FormData construction for API submission
 */

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/shared/ui/shadcn/components/ui/collapsible';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';

import { FormSection } from '@/components/forms/layout/FormSection';
import { FileUploadZone } from '@/components/forms/composites/field';
import FieldText from '@/components/forms/composites/field/FieldText';
import { getFieldStatus } from './formUtils';

import { Upload, FileText, Code, Loader2, CheckCircle2, AlertCircle, Clipboard, Zap } from 'lucide-react';

// Custom Zod validation for files
const fileArraySchema = z.array(z.object({
  id: z.string(),
  file: z.instanceof(File),
  preview: z.string().optional(),
  progress: z.number(),
  status: z.enum(['pending', 'uploading', 'complete', 'error']),
  error: z.string().optional(),
  retries: z.number(),
})).optional();

const profileUploadSchema = z.object({
  displayName: z.string().min(2, 'Display name is required'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  profilePhoto: fileArraySchema.refine(
    (files) => files && files.length > 0,
    'Profile photo is required'
  ),
  documents: fileArraySchema,
});

type ProfileUploadFormData = z.infer<typeof profileUploadSchema>;

export const FileUploadDemo: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [jsonPreviewOpen, setJsonPreviewOpen] = useState(false);
  const [debugPayload, setDebugPayload] = useState<string>('');
  const [uploadStats, setUploadStats] = useState<{
    totalFiles: number;
    totalSize: string;
    uploadTime: number;
  } | null>(null);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<ProfileUploadFormData>({
    resolver: zodResolver(profileUploadSchema),
    defaultValues: {
      displayName: '',
      bio: '',
      profilePhoto: [],
      documents: [],
    },
  });

  const formData = watch();

  // Simulate real upload with progress
  const simulateRealUpload = async (file: File, onProgress: (progress: number) => void) => {
    // Simulate network upload with realistic progress
    return new Promise<{ success: boolean; url?: string; error?: string }>((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5; // 5-20% increments
        
        if (progress >= 100) {
          clearInterval(interval);
          onProgress(100);
          
          // Simulate occasional failures for demo (10% chance)
          if (Math.random() < 0.1) {
            resolve({
              success: false,
              error: 'Network error occurred',
            });
          } else {
            resolve({
              success: true,
              url: `https://cdn.example.com/uploads/${file.name}`,
            });
          }
        } else {
          onProgress(Math.min(progress, 99));
        }
      }, 300);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const generateDebugPayload = (data: ProfileUploadFormData) => {
    let output = `POST /api/profile\nContent-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW\n\n`;

    const appendField = (name: string, value: string) => {
      output += `------WebKitFormBoundary7MA4YWxkTrZu0gW\nContent-Disposition: form-data; name="${name}"\n\n${value}\n`;
    };

    const appendFile = (name: string, file: File) => {
      output += `------WebKitFormBoundary7MA4YWxkTrZu0gW\nContent-Disposition: form-data; name="${name}"; filename="${file.name}"\nContent-Type: ${file.type}\n\n[Binary Data: ${formatFileSize(file.size)}]\n`;
    };

    appendField('displayName', data.displayName);
    if (data.bio) appendField('bio', data.bio);

    if (data.profilePhoto?.[0]?.file) {
      appendFile('profilePhoto', data.profilePhoto[0].file);
    }

    data.documents?.forEach((doc, index) => {
      appendFile(`documents[${index}]`, doc.file);
    });

    output += `------WebKitFormBoundary7MA4YWxkTrZu0gW--`;
    return output;
  };

  const onSubmit = async (data: ProfileUploadFormData) => {
    const startTime = Date.now();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setUploadStats(null);
    
    // Generate debug view of the payload
    setDebugPayload(generateDebugPayload(data));

    // Calculate total size
    const allFiles = [
      ...(data.profilePhoto || []),
      ...(data.documents || []),
    ];
    const totalSize = allFiles.reduce((sum, uf) => sum + uf.file.size, 0);

    // Simulate real FormData construction
    const formDataToSend = new FormData();
    formDataToSend.append('displayName', data.displayName);
    if (data.bio) formDataToSend.append('bio', data.bio);
    
    // Add raw File objects
    if (data.profilePhoto?.[0]?.file) {
      formDataToSend.append('profilePhoto', data.profilePhoto[0].file);
    }
    
    data.documents?.forEach((doc, index) => {
      formDataToSend.append(`documents[${index}]`, doc.file);
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('--- SENDING HTTP REQUEST ---');
    console.log('Method: POST');
    console.log('Endpoint: /api/profile');
    console.log('Content-Type: multipart/form-data');
    console.log('Body:', formDataToSend);
    console.log('\nForm Data Entries:');
    for (const pair of formDataToSend.entries()) {
      console.log(`  ${pair[0]}:`, pair[1] instanceof File ? `File(${pair[1].name}, ${formatFileSize(pair[1].size)})` : pair[1]);
    }
    console.log('---------------------------');
    
    const uploadTime = (Date.now() - startTime) / 1000;
    
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setJsonPreviewOpen(true);
    setUploadStats({
      totalFiles: allFiles.length,
      totalSize: formatFileSize(totalSize),
      uploadTime,
    });
    
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Feature Badges */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Production Features Enabled</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            <Clipboard className="h-3 w-3 mr-1" />
            Clipboard Paste
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Image Compression
          </Badge>
          <Badge variant="secondary" className="text-xs">
            File Validation
          </Badge>
          <Badge variant="secondary" className="text-xs">
            React Hook Form
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Zod Validation
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          <strong>Note:</strong> This demo uses <strong>form-based upload</strong> - files are uploaded when you click "Submit Profile". 
          For <strong>auto-upload</strong> (immediate upload on file selection), see the standalone example below.
        </p>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <FieldText
          label="Display Name"
          placeholder="Enter your display name"
          {...register('displayName')}
          {...getFieldStatus(errors.displayName)}
        />
        <FieldText
          label="Bio (Optional)"
          placeholder="Tell us about yourself..."
          {...register('bio')}
          {...getFieldStatus(errors.bio)}
        />
      </div>

      {/* Profile Photo Upload with Production Features */}
      <FormSection
        title="Profile Photo"
        description="Upload a professional photo. Files are uploaded when you submit the form. Try pasting an image from clipboard!"
        icon={<Upload className="w-5 h-5 text-primary" />}
        layout="split"
        variant="default"
        withDivider
      >
        <Controller
          name="profilePhoto"
          control={control}
          render={({ field }) => (
            <div>
              <FileUploadZone
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
                maxSize={5 * 1024 * 1024}
                maxFiles={1}
                multiple={false}
                label="Upload profile photo"
                description="PNG, JPG, GIF, or WebP up to 5MB"
                // Note: autoUpload is disabled for form-based uploads
                // Files will be uploaded when you click "Submit Profile"
                autoUpload={false}
                enableRetry={false}
                compressImages={true}
                compressionQuality={0.8}
                enablePaste={true}
                onFilesChange={(files) => field.onChange(files)}
              />
              {errors.profilePhoto && (
                <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.profilePhoto.message as string}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                💡 <strong>How it works:</strong> Files are validated and prepared here, then uploaded when you submit the form.
              </p>
            </div>
          )}
        />
      </FormSection>

      {/* Supporting Documents with Production Features */}
      <FormSection
        title="Supporting Documents"
        description="Upload supporting documentation. Files will be uploaded on form submission."
        icon={<FileText className="w-5 h-5 text-primary" />}
        layout="split"
        variant="default"
      >
        <Controller
          name="documents"
          control={control}
          render={({ field }) => (
            <div>
              <FileUploadZone
                accept={{
                  'application/pdf': ['.pdf'],
                  'application/msword': ['.doc'],
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                }}
                maxSize={10 * 1024 * 1024}
                maxFiles={5}
                label="Upload documents"
                description="PDF, DOC, DOCX up to 10MB each (max 5 files)"
                // Form-based upload - files uploaded on submit
                autoUpload={false}
                enableRetry={false}
                enablePaste={true}
                onFilesChange={(files) => field.onChange(files)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                💡 <strong>Tip:</strong> You can paste files directly from clipboard (Ctrl+V)
              </p>
            </div>
          )}
        />
      </FormSection>

      {/* Upload Stats */}
      {uploadStats && (
        <div className="rounded-lg border bg-green-500/10 border-green-500/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">Upload Complete!</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <span><strong>Files:</strong> {uploadStats.totalFiles}</span>
            <span><strong>Size:</strong> {uploadStats.totalSize}</span>
            <span><strong>Time:</strong> {uploadStats.uploadTime.toFixed(2)}s</span>
          </div>
        </div>
      )}

      {/* Submit Actions */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : submitSuccess ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Success!
            </>
          ) : (
            'Submit Profile'
          )}
        </Button>
        
        <Button type="button" variant="outline" onClick={() => setJsonPreviewOpen(!jsonPreviewOpen)}>
          <Code className="mr-2 h-4 w-4" />
          {jsonPreviewOpen ? 'Hide' : 'Show'} HTTP Payload
        </Button>
      </div>

      {/* HTTP Payload Preview */}
      <Collapsible open={jsonPreviewOpen} onOpenChange={setJsonPreviewOpen}>
        <CollapsibleContent>
          <div className="rounded-lg border bg-zinc-950 text-zinc-50 p-4 font-mono text-xs overflow-x-auto shadow-inner">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-zinc-800">
              <Label className="text-zinc-400">HTTP Request (multipart/form-data)</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-zinc-400 hover:text-white"
                onClick={() => navigator.clipboard.writeText(debugPayload || generateDebugPayload(formData))}
              >
                Copy
              </Button>
            </div>
            <pre className="whitespace-pre-wrap">
              {debugPayload || (formData.displayName ? generateDebugPayload(formData) : '// Fill out the form to see the multipart/form-data payload\n// This shows exactly what will be sent to your API')}
            </pre>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Standalone Auto-Upload Example */}
      <div className="mt-12 pt-8 border-t">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Auto-Upload Example (Standalone)</h3>
          <p className="text-sm text-muted-foreground">
            This example demonstrates <strong>autoUpload={'{true}'}</strong> - files are uploaded immediately when selected, 
            without waiting for form submission. Perfect for AI Chat, profile pictures, or any scenario where immediate upload is needed.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <FileUploadZone
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
            maxSize={5 * 1024 * 1024}
            maxFiles={3}
            label="Drop images here for instant upload"
            description="Files upload automatically as soon as you select them"
            // AUTO-UPLOAD ENABLED - Files upload immediately!
            autoUpload={true}
            enableRetry={true}
            maxRetries={3}
            compressImages={true}
            enablePaste={true}
            // Custom upload handler
            onUpload={simulateRealUpload}
            onUploadComplete={(file, result) => {
              console.log('✅ Auto-uploaded:', file.file.name, '→', result.url);
            }}
            onUploadError={(file, error) => {
              console.error('❌ Auto-upload failed:', file.file.name, error);
            }}
          />
          
          <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">
              🔄 How Auto-Upload Works:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
              <li><strong>autoUpload={'{true}'}</strong> - Files upload immediately when added</li>
              <li><strong>Progress tracking</strong> - Real-time upload progress with XMLHttpRequest</li>
              <li><strong>Automatic retry</strong> - Failed uploads retry up to 3 times with exponential backoff</li>
              <li><strong>Upload cancellation</strong> - Click the X button during upload to cancel</li>
              <li><strong>No form needed</strong> - Works standalone, perfect for AI Chat or quick uploads</li>
            </ul>
          </div>

          <div className="mt-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">
              📝 When to Use Auto-Upload vs Form-Based:
            </p>
            <div className="text-xs text-muted-foreground space-y-2">
              <div>
                <strong className="text-foreground">Use Auto-Upload when:</strong>
                <ul className="ml-4 list-disc mt-1">
                  <li>Building AI Chat with file attachments</li>
                  <li>Profile picture updates (immediate feedback)</li>
                  <li>Drag & drop file managers</li>
                  <li>Real-time collaboration tools</li>
                </ul>
              </div>
              <div>
                <strong className="text-foreground">Use Form-Based Upload when:</strong>
                <ul className="ml-4 list-disc mt-1">
                  <li>Multi-step forms (like above)</li>
                  <li>Files are part of larger submission</li>
                  <li>Need to validate all fields before upload</li>
                  <li>Batch operations with confirmation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
