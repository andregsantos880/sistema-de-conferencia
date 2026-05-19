import React from 'react';
import { FileText, Image as ImageIcon, Video, FolderOpen } from 'lucide-react';

const files = [
  { id: 1, name: 'brand_guide.pdf', icon: FileText, color: 'text-blue-500' },
  { id: 2, name: 'hero_banner.png', icon: ImageIcon, color: 'text-emerald-500' },
  { id: 3, name: 'explainer.mp4', icon: Video, color: 'text-purple-500' },
];

export const RecentFilesWidget: React.FC = () => {
  return (
    <div className="flex flex-col h-full p-4 space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Recent Files</label>
        <div className="space-y-1">
          {files.map(file => (
            <div key={file.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-hover transition-colors cursor-pointer group">
              <file.icon className={`size-4 ${file.color}`} />
              <span className="text-xs truncate">{file.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <button className="w-full py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center justify-center gap-2">
        <FolderOpen className="size-3" /> Browse All
      </button>
    </div>
  );
};
