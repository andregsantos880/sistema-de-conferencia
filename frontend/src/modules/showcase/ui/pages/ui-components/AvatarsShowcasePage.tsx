import React from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Avatar, AvatarImage, AvatarFallback } from '@/shadcn/components/ui/avatar';
import {
  AvatarGroup,
  AvatarGroupTooltip,
  AvatarGroupTooltipArrow,
} from '@/shared/ui/shadcn/components/animate-ui/primitives/animate/avatar-group';
import { cn } from '@/shadcn/lib/utils';

// pravatar.cc avatar URLs for consistent, unique avatars
const getAvatarUrl = (seed: string, size: number = 128) =>
  `https://i.pravatar.cc/${size}?u=${encodeURIComponent(seed)}`;

// Sample user data with DiceBear avatars
const users = [
  { id: 1, name: 'Sarah Chen', initials: 'SC', role: 'Product Manager', status: 'online' as const },
  { id: 2, name: 'Marcus Johnson', initials: 'MJ', role: 'Senior Developer', status: 'online' as const },
  { id: 3, name: 'Emily Rodriguez', initials: 'ER', role: 'UX Designer', status: 'away' as const },
  { id: 4, name: 'David Kim', initials: 'DK', role: 'DevOps Engineer', status: 'offline' as const },
  { id: 5, name: 'Lisa Thompson', initials: 'LT', role: 'QA Lead', status: 'online' as const },
  { id: 6, name: 'James Wilson', initials: 'JW', role: 'Frontend Developer', status: 'offline' as const },
  { id: 7, name: 'Anna Martinez', initials: 'AM', role: 'Backend Developer', status: 'away' as const },
  { id: 8, name: 'Michael Brown', initials: 'MB', role: 'Tech Lead', status: 'online' as const },
];

const statusColors = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  offline: 'bg-gray-400',
};

const AvatarsShowcasePage: React.FC = () => {
  return (
    <ShowcasePage
      title="Avatars"
      description="Avatar components for displaying user images and initials."
    >
      {/* Size Variations with Real Images */}
      <ShowcaseSection
        title="Avatar Sizes"
        description="Avatars in different sizes with real avatar images from DiceBear."
      >
        <CodeExample
          id="avatars-sizes"
          title="Size Variations"
          code={`// Using pravatar.cc for consistent avatars
const getAvatarUrl = (seed: string, size: number = 128) =>
  \`https://i.pravatar.cc/\${size}?u=\${seed}\`;

<Avatar className="h-6 w-6">
  <AvatarImage src={getAvatarUrl('user1')} alt="User" />
  <AvatarFallback>XS</AvatarFallback>
</Avatar>
<Avatar className="h-8 w-8">...</Avatar>
<Avatar className="h-10 w-10">...</Avatar>
<Avatar className="h-12 w-12">...</Avatar>
<Avatar className="h-16 w-16">...</Avatar>`}
        >
          <div className="flex items-end gap-4">
            <div className="text-center">
              <Avatar className="h-6 w-6">
                <AvatarImage src={getAvatarUrl('xs-user', 48)} alt="Extra small" />
                <AvatarFallback className="text-[10px]">XS</AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground mt-2">24px</p>
            </div>
            <div className="text-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src={getAvatarUrl('sm-user', 64)} alt="Small" />
                <AvatarFallback className="text-xs">SM</AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground mt-2">32px</p>
            </div>
            <div className="text-center">
              <Avatar className="h-10 w-10">
                <AvatarImage src={getAvatarUrl('md-user', 80)} alt="Medium" />
                <AvatarFallback className="text-sm">MD</AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground mt-2">40px</p>
            </div>
            <div className="text-center">
              <Avatar className="h-12 w-12">
                <AvatarImage src={getAvatarUrl('lg-user', 96)} alt="Large" />
                <AvatarFallback>LG</AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground mt-2">48px</p>
            </div>
            <div className="text-center">
              <Avatar className="h-16 w-16">
                <AvatarImage src={getAvatarUrl('xl-user', 128)} alt="Extra large" />
                <AvatarFallback className="text-lg">XL</AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground mt-2">64px</p>
            </div>
            <div className="text-center">
              <Avatar className="h-20 w-20">
                <AvatarImage src={getAvatarUrl('xxl-user', 160)} alt="2X large" />
                <AvatarFallback className="text-xl">2X</AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground mt-2">80px</p>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Fallback Behavior */}
      <ShowcaseSection
        title="Fallback Behavior"
        description="Avatars gracefully fall back to initials when images fail to load."
      >
        <CodeExample
          id="avatars-fallback"
          title="Image & Fallback States"
          code={`<Avatar>
  <AvatarImage src="valid-url.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>

<Avatar>
  <AvatarImage src="invalid-url.jpg" alt="User" />
  <AvatarFallback>AB</AvatarFallback>
</Avatar>`}
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">With Valid Images</p>
              <div className="flex items-center gap-3">
                {users.slice(0, 4).map((user) => (
                  <Avatar key={user.id} className="h-10 w-10">
                    <AvatarImage src={getAvatarUrl(user.name, 80)} alt={user.name} />
                    <AvatarFallback>{user.initials}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3">Fallback to Initials (broken image URLs)</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://invalid-url.com/avatar.jpg" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://invalid-url.com/avatar2.jpg" alt="User" />
                  <AvatarFallback>AB</AvatarFallback>
                </Avatar>
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://invalid-url.com/avatar3.jpg" alt="User" />
                  <AvatarFallback>CD</AvatarFallback>
                </Avatar>
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://invalid-url.com/avatar4.jpg" alt="User" />
                  <AvatarFallback>EF</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3">Styled Fallbacks</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30">
                  <AvatarFallback className="text-blue-600 dark:text-blue-400 bg-transparent">JD</AvatarFallback>
                </Avatar>
                <Avatar className="h-10 w-10 bg-green-100 dark:bg-green-900/30">
                  <AvatarFallback className="text-green-600 dark:text-green-400 bg-transparent">AB</AvatarFallback>
                </Avatar>
                <Avatar className="h-10 w-10 bg-purple-100 dark:bg-purple-900/30">
                  <AvatarFallback className="text-purple-600 dark:text-purple-400 bg-transparent">CD</AvatarFallback>
                </Avatar>
                <Avatar className="h-10 w-10 bg-orange-100 dark:bg-orange-900/30">
                  <AvatarFallback className="text-orange-600 dark:text-orange-400 bg-transparent">EF</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Avatar Groups with Overflow */}
      <ShowcaseSection
        title="Avatar Groups"
        description="Grouped avatars with overlapping layout, tooltips, and +N overflow indicator."
      >
        <CodeExample
          id="avatar-groups"
          title="Grouped Avatars with Overflow"
          code={`<AvatarGroup className="-space-x-3">
  {users.slice(0, 3).map(user => (
    <Avatar key={user.id} className="h-10 w-10 border-2 border-background">
      <AvatarImage src={getAvatarUrl(user.name)} alt={user.name} />
      <AvatarFallback>{user.initials}</AvatarFallback>
    </Avatar>
  ))}
  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
    +{users.length - 3}
  </div>
</AvatarGroup>`}
        >
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-3">Small Group (3 visible)</p>
              <AvatarGroup className="h-8 -space-x-2" translate="-20%">
                {users.slice(0, 3).map((user) => (
                  <Avatar key={user.id} className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={getAvatarUrl(user.name)} alt={user.name} />
                    <AvatarFallback className="text-xs">{user.initials}</AvatarFallback>
                    <AvatarGroupTooltip className="bg-primary px-2 py-1 text-xs text-primary-foreground rounded">
                      <AvatarGroupTooltipArrow className="fill-primary size-2.5" />
                      {user.name}
                    </AvatarGroupTooltip>
                  </Avatar>
                ))}
              </AvatarGroup>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-3">Medium Group with Overflow</p>
              <AvatarGroup className="h-10 -space-x-3" translate="-24%">
                {[
                  ...users.slice(0, 4).map((user) => (
                    <Avatar key={user.id} className="h-10 w-10 border-2 border-background">
                      <AvatarImage src={getAvatarUrl(user.name, 80)} alt={user.name} />
                      <AvatarFallback>{user.initials}</AvatarFallback>
                      <AvatarGroupTooltip className="bg-primary px-2 py-1.5 text-sm text-primary-foreground rounded">
                        <AvatarGroupTooltipArrow className="fill-primary size-3" />
                        {user.name}
                      </AvatarGroupTooltip>
                    </Avatar>
                  )),
                  <div
                    key="overflow"
                    className="h-10 w-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground"
                  >
                    +{users.length - 4}
                  </div>,
                ]}
              </AvatarGroup>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-3">Large Group with Inverted Overlap</p>
              <AvatarGroup className="h-12 -space-x-4" translate="-28%" invertOverlap>
                {[
                  ...users.slice(0, 5).map((user) => (
                    <Avatar key={user.id} className="h-12 w-12 border-3 border-background">
                      <AvatarImage src={getAvatarUrl(user.name, 110)} alt={user.name} />
                      <AvatarFallback>{user.initials}</AvatarFallback>
                      <AvatarGroupTooltip className="bg-primary px-3 py-2 text-sm text-primary-foreground rounded">
                        <AvatarGroupTooltipArrow className="fill-primary size-3.5" />
                        {user.name}
                      </AvatarGroupTooltip>
                    </Avatar>
                  )),
                  <div
                    key="overflow"
                    className="h-12 w-12 rounded-full bg-muted border-3 border-background flex items-center justify-center text-sm font-medium text-muted-foreground"
                  >
                    +{users.length - 5}
                  </div>,
                ]}
              </AvatarGroup>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Avatar with Name & Role */}
      <ShowcaseSection
        title="Avatar with User Info"
        description="Avatar combined with name and secondary text like role or email."
      >
        <CodeExample
          id="avatars-with-info"
          title="Avatar + Name + Role"
          code={`<div className="flex items-center gap-3">
  <Avatar className="h-10 w-10">
    <AvatarImage src={avatarUrl} alt={user.name} />
    <AvatarFallback>{user.initials}</AvatarFallback>
  </Avatar>
  <div>
    <p className="text-sm font-medium">{user.name}</p>
    <p className="text-xs text-muted-foreground">{user.role}</p>
  </div>
</div>`}
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">Standard Layout</p>
              <div className="space-y-3">
                {users.slice(0, 3).map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getAvatarUrl(user.name)} alt={user.name} />
                      <AvatarFallback>{user.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{user.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-3">Compact Layout</p>
              <div className="flex flex-wrap gap-4">
                {users.slice(0, 4).map((user) => (
                  <div key={user.id} className="flex items-center gap-2 bg-muted/50 rounded-full pl-1 pr-3 py-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={getAvatarUrl(user.name)} alt={user.name} />
                      <AvatarFallback className="text-[10px]">{user.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-3">Card Layout</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                {users.slice(0, 4).map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={getAvatarUrl(user.name, 120)} alt={user.name} />
                      <AvatarFallback>{user.initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Status Indicators */}
      <ShowcaseSection
        title="Status Indicators"
        description="Avatars with online/offline/away status indicators."
      >
        <CodeExample
          id="avatars-status"
          title="Avatar with Status"
          code={`<div className="relative">
  <Avatar className="h-10 w-10">
    <AvatarImage src={avatarUrl} alt={user.name} />
    <AvatarFallback>{user.initials}</AvatarFallback>
  </Avatar>
  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
</div>`}
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">Status Dot Positions</p>
              <div className="flex items-center gap-6">
                {users.slice(0, 4).map((user) => (
                  <div key={user.id} className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getAvatarUrl(user.name)} alt={user.name} />
                      <AvatarFallback>{user.initials}</AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background',
                        statusColors[user.status]
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-3">With User Info</p>
              <div className="space-y-3">
                {users.slice(0, 3).map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={getAvatarUrl(user.name)} alt={user.name} />
                        <AvatarFallback>{user.initials}</AvatarFallback>
                      </Avatar>
                      <span
                        className={cn(
                          'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background',
                          statusColors[user.status]
                        )}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">{user.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-3">Size Variations with Status</p>
              <div className="flex items-end gap-4">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getAvatarUrl('small-status', 64)} alt="Small" />
                    <AvatarFallback className="text-xs">SM</AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
                </div>
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={getAvatarUrl('medium-status', 80)} alt="Medium" />
                    <AvatarFallback>MD</AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-yellow-500 border-2 border-background" />
                </div>
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={getAvatarUrl('large-status', 96)} alt="Large" />
                    <AvatarFallback>LG</AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-gray-400 border-2 border-background" />
                </div>
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={getAvatarUrl('xlarge-status', 128)} alt="Extra large" />
                    <AvatarFallback className="text-lg">XL</AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-background" />
                </div>
              </div>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default AvatarsShowcasePage;

