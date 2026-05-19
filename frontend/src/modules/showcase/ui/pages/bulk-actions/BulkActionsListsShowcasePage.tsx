import React, { useState } from 'react';
import { Trash2, Archive, Star, MoreHorizontal, Mail, File, CheckCircle, X } from 'lucide-react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Checkbox } from '@/shared/ui/shadcn/components/ui/checkbox';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/components/ui/dropdown-menu';
import { cn } from '@/shadcn/lib/utils';
import { useBulkSelection } from '@/shared/hooks';

interface Message {
  id: number;
  from: string;
  subject: string;
  preview: string;
  date: string;
  starred: boolean;
  read: boolean;
}

interface FileItem {
  id: number;
  name: string;
  type: 'document' | 'image' | 'spreadsheet';
  size: string;
  modified: string;
}

const initialMessages: Message[] = [
  { id: 1, from: 'Alice Johnson', subject: 'Project Update', preview: 'Here is the latest update on the project...', date: 'Dec 10', starred: true, read: true },
  { id: 2, from: 'Bob Smith', subject: 'Meeting Tomorrow', preview: 'Can we schedule a meeting for tomorrow?', date: 'Dec 9', starred: false, read: false },
  { id: 3, from: 'Carol Williams', subject: 'Q4 Report', preview: 'Please find attached the Q4 report...', date: 'Dec 8', starred: false, read: true },
  { id: 4, from: 'David Brown', subject: 'Quick Question', preview: 'I had a quick question about the...', date: 'Dec 7', starred: true, read: false },
  { id: 5, from: 'Eva Martinez', subject: 'Feedback Request', preview: 'Could you provide feedback on...', date: 'Dec 6', starred: false, read: true },
];

const initialFiles: FileItem[] = [
  { id: 1, name: 'Project Proposal.docx', type: 'document', size: '2.4 MB', modified: 'Dec 10' },
  { id: 2, name: 'Budget 2024.xlsx', type: 'spreadsheet', size: '1.2 MB', modified: 'Dec 9' },
  { id: 3, name: 'Team Photo.jpg', type: 'image', size: '4.8 MB', modified: 'Dec 8' },
  { id: 4, name: 'Meeting Notes.docx', type: 'document', size: '156 KB', modified: 'Dec 7' },
  { id: 5, name: 'Analytics Report.xlsx', type: 'spreadsheet', size: '3.1 MB', modified: 'Dec 6' },
];

const BulkActionsListsShowcasePage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [feedback, setFeedback] = useState<string | null>(null);

  const messageSelection = useBulkSelection<number>();
  const fileSelection = useBulkSelection<number>();

  const messageIds = messages.map((m) => m.id);
  const fileIds = files.map((f) => f.id);

  const showFeedback = (message: string) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Message handlers
  const selectAllMessages = () => {
    if (messageSelection.isAllSelected(messageIds)) {
      messageSelection.clear();
    } else {
      messageSelection.selectAll(messageIds);
    }
  };

  const handleArchiveMessages = () => {
    const count = messageSelection.selectedCount;
    setMessages((prev) => prev.filter((m) => !messageSelection.isSelected(m.id)));
    showFeedback(`${count} messages archived`);
    messageSelection.clear();
  };

  const handleDeleteMessages = () => {
    const count = messageSelection.selectedCount;
    setMessages((prev) => prev.filter((m) => !messageSelection.isSelected(m.id)));
    showFeedback(`${count} messages deleted`);
    messageSelection.clear();
  };

  const handleMarkAsRead = () => {
    const count = messageSelection.selectedCount;
    setMessages((prev) =>
      prev.map((m) => (messageSelection.isSelected(m.id) ? { ...m, read: true } : m))
    );
    showFeedback(`${count} messages marked as read`);
    messageSelection.clear();
  };

  // File handlers
  const selectAllFiles = () => {
    if (fileSelection.isAllSelected(fileIds)) {
      fileSelection.clear();
    } else {
      fileSelection.selectAll(fileIds);
    }
  };

  const handleDeleteFiles = () => {
    const count = fileSelection.selectedCount;
    setFiles((prev) => prev.filter((f) => !fileSelection.isSelected(f.id)));
    showFeedback(`${count} files deleted`);
    fileSelection.clear();
  };

  const getFileIcon = (type: FileItem['type']) => {
    switch (type) {
      case 'document':
        return <File className="h-5 w-5 text-blue-500" />;
      case 'spreadsheet':
        return <File className="h-5 w-5 text-green-500" />;
      case 'image':
        return <File className="h-5 w-5 text-purple-500" />;
    }
  };

  return (
    <ShowcasePage
      title="List Bulk Actions"
      description="Demonstrate multi-selection in card and list layouts with bulk actions via action bar and contextual menus."
    >
      {/* Feedback Toast */}
      {feedback && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 fade-in-0 duration-300">
          <div className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg shadow-lg">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{feedback}</span>
          </div>
        </div>
      )}

      <ShowcaseSection
        title="Message List with Bulk Actions"
        description="Select messages to reveal bulk actions. Use the action bar or right-click for contextual menu."
      >
        <CodeExample
          id="bulk-actions"
          title="Message List Bulk Selection"
          code={`const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

const toggleSelect = (id: number) => {
  setSelectedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
};

<Card>
  {/* Bulk Action Bar */}
  {selectedIds.size > 0 && (
    <div className="flex items-center justify-between p-3 bg-primary/10 border-b">
      <span>{selectedIds.size} selected</span>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleArchive}><Archive /> Archive</Button>
        <Button size="sm" onClick={handleMarkAsRead}><Mail /> Mark as Read</Button>
        <Button size="sm" variant="destructive" onClick={handleDelete}><Trash2 /> Delete</Button>
      </div>
    </div>
  )}
  
  {/* Message List */}
  <div className="divide-y">
    {messages.map(message => (
      <div
        key={message.id}
        className={cn(
          "flex items-center gap-3 p-3 hover:bg-muted/50",
          selectedIds.has(message.id) && "bg-primary/5"
        )}
      >
        <Checkbox
          checked={selectedIds.has(message.id)}
          onCheckedChange={() => toggleSelect(message.id)}
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{message.from}</p>
          <p className="text-sm text-muted-foreground truncate">{message.subject}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm"><MoreHorizontal /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Archive</DropdownMenuItem>
            <DropdownMenuItem>Mark as Read</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ))}
  </div>
</Card>`}
        >
          <Card>
            {/* Header with Select All */}
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Inbox</CardTitle>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={messageSelection.isAllSelected(messageIds)}
                    onCheckedChange={selectAllMessages}
                    aria-label="Select all messages"
                  />
                  <span className="text-xs text-muted-foreground">Select all</span>
                </div>
              </div>
            </CardHeader>

            {/* Bulk Action Bar */}
            {messageSelection.selectedCount > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 mx-4 mt-3 bg-primary/10 rounded-lg animate-in slide-in-from-top-1 fade-in-0 duration-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{messageSelection.selectedCount} selected</span>
                  <Button variant="ghost" size="sm" className="h-7" onClick={() => messageSelection.clear()}>
                    <X className="h-3 w-3 mr-1" /> Clear
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8" onClick={handleArchiveMessages}>
                    <Archive className="h-4 w-4 mr-1" /> Archive
                  </Button>
                  <Button variant="outline" size="sm" className="h-8" onClick={handleMarkAsRead}>
                    <Mail className="h-4 w-4 mr-1" /> Mark Read
                  </Button>
                  <Button variant="destructive" size="sm" className="h-8" onClick={handleDeleteMessages}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            )}

            {/* Message List */}
            <CardContent className="p-0 mt-3">
              <div className="divide-y">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                      messageSelection.isSelected(message.id) && "bg-primary/5",
                    )}
                    onClick={() => messageSelection.toggle(message.id)}
                  >
                    <Checkbox
                      checked={messageSelection.isSelected(message.id)}
                      onCheckedChange={() => messageSelection.toggle(message.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select message from ${message.from}`}
                    />
                    <button
                      className={cn(
                        "p-1 hover:bg-muted rounded transition-colors",
                        message.starred ? "text-yellow-500" : "text-muted-foreground"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMessages((prev) =>
                          prev.map((m) => (m.id === message.id ? { ...m, starred: !m.starred } : m))
                        );
                      }}
                    >
                      <Star className={cn("h-4 w-4", message.starred && "fill-current")} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "font-medium text-sm truncate",
                          !message.read && "font-bold"
                        )}>
                          {message.from}
                        </p>
                        {!message.read && (
                          <Badge variant="secondary" className="h-5 text-xs">New</Badge>
                        )}
                      </div>
                      <p className={cn("text-sm truncate", !message.read && "font-bold")}>{message.subject}</p>
                      <p className="text-xs text-muted-foreground truncate">{message.preview}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{message.date}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Archive className="h-4 w-4 mr-2" /> Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" /> Mark as Read
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Star className="h-4 w-4 mr-2" /> Star
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>

              {messages.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No messages</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setMessages(initialMessages)}
                  >
                    Reset Data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="File Grid with Bulk Actions"
        description="Card-based file browser with multi-select and bulk operations."
      >
        <CodeExample
          id="bulk-actions"
          title="File Grid Bulk Selection"
          code={`<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {files.map(file => (
    <div
      key={file.id}
      onClick={() => toggleSelect(file.id)}
      className={cn(
        "p-4 border rounded-lg cursor-pointer transition-all",
        selectedIds.has(file.id) && "ring-2 ring-primary bg-primary/5"
      )}
    >
      <div className="flex items-start justify-between">
        <Checkbox checked={selectedIds.has(file.id)} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm"><MoreHorizontal /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Download</DropdownMenuItem>
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-4 text-center">
        <File className="h-10 w-10 mx-auto" />
        <p className="mt-2 text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">{file.size}</p>
      </div>
    </div>
  ))}
</div>`}
        >
          <Card>
            {/* Header */}
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Files</CardTitle>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={fileSelection.isAllSelected(fileIds)}
                    onCheckedChange={selectAllFiles}
                    aria-label="Select all files"
                  />
                  <span className="text-xs text-muted-foreground">Select all</span>
                </div>
              </div>
            </CardHeader>

            {/* Bulk Action Bar */}
            {fileSelection.selectedCount > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 mx-4 mt-3 bg-primary/10 rounded-lg animate-in slide-in-from-top-1 fade-in-0 duration-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{fileSelection.selectedCount} files selected</span>
                  <Button variant="ghost" size="sm" className="h-7" onClick={() => fileSelection.clear()}>
                    <X className="h-3 w-3 mr-1" /> Clear
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8">
                    Download
                  </Button>
                  <Button variant="destructive" size="sm" className="h-8" onClick={handleDeleteFiles}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            )}

            {/* File Grid */}
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => fileSelection.toggle(file.id)}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-all hover:border-primary/50",
                      fileSelection.isSelected(file.id) && "ring-2 ring-primary bg-primary/5"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <Checkbox
                        checked={fileSelection.isSelected(file.id)}
                        onCheckedChange={() => fileSelection.toggle(file.id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${file.name}`}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Download</DropdownMenuItem>
                          <DropdownMenuItem>Rename</DropdownMenuItem>
                          <DropdownMenuItem>Share</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-4 text-center">
                      <div className="w-12 h-12 mx-auto flex items-center justify-center bg-muted rounded-lg">
                        {getFileIcon(file.type)}
                      </div>
                      <p className="mt-2 text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.size} • {file.modified}</p>
                    </div>
                  </div>
                ))}
              </div>

              {files.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No files</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setFiles(initialFiles)}
                  >
                    Reset Data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default BulkActionsListsShowcasePage;
