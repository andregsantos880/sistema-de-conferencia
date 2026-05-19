import React, { useState, useEffect } from 'react';
import { Edit2, Check, X, Mail, Phone, MapPin, Building } from 'lucide-react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import { Textarea } from '@/shared/ui/shadcn/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/components/ui/select';
import { useInlineEdit } from '@/shared/hooks';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  company: string;
  location: string;
  bio: string;
  role: string;
}

const initialProfile: ProfileData = {
  name: 'Alice Johnson',
  email: 'alice@company.com',
  phone: '+1 (555) 123-4567',
  company: 'Tech Corp',
  location: 'San Francisco, CA',
  bio: 'Senior software engineer with 8+ years of experience building scalable web applications. Passionate about clean code and user experience.',
  role: 'Engineering',
};

const EditableCardsShowcasePage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);

  const edit = useInlineEdit({
    initialValue: profile,
    onSave: (newProfile) => setProfile(newProfile),
    enableKeyboardShortcuts: false,
  });

  // Sync external profile changes
  const { isEditing, setOriginalValue } = edit;
  useEffect(() => {
    if (!isEditing) {
      setOriginalValue(profile);
    }
  }, [profile, isEditing, setOriginalValue]);

  const handleChange = (field: keyof ProfileData, value: string) => {
    edit.setDraft((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ShowcasePage
      title="Editable Cards"
      description="Demonstrate inline editing within card components - toggle between read mode and edit mode without page navigation."
    >
      <ShowcaseSection
        title="Profile Card with Edit Mode"
        description="Click 'Edit' to switch to edit mode. Changes are applied on save or discarded on cancel."
      >
        <CodeExample
          id="inline-editing"
          title="Card Read/Edit Mode Toggle"
          code={`import { useInlineEdit } from '@/shared/hooks';

const [profile, setProfile] = useState(initialProfile);

const edit = useInlineEdit({
  initialValue: profile,
  onSave: async (updated) => {
    await saveProfile(updated);
    setProfile(updated);
  },
});

<Card>
  <CardHeader className="flex flex-row items-center justify-between">
    <CardTitle>Profile</CardTitle>
    {edit.isEditing ? (
      <div className="flex gap-2">
        <Button size="sm" onClick={edit.save}><Check /> Save</Button>
        <Button size="sm" variant="ghost" onClick={edit.cancel}><X /> Cancel</Button>
      </div>
    ) : (
      <Button size="sm" variant="outline" onClick={edit.start}>
        <Edit2 /> Edit
      </Button>
    )}
  </CardHeader>
  <CardContent>
    {edit.isEditing ? (
      // Edit Mode - use edit.draft and edit.setDraft
      <div className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input
            value={edit.draft.name}
            onChange={(e) => edit.setDraft({ ...edit.draft, name: e.target.value })}
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            value={edit.draft.email}
            onChange={(e) => edit.setDraft({ ...edit.draft, email: e.target.value })}
          />
        </div>
      </div>
    ) : (
      // Read Mode - use edit.value
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{edit.value.email}</span>
        </div>
      </div>
    )}
  </CardContent>
</Card>`}
        >
          <div className="max-w-2xl">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="text-xl">Profile Information</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isEditing ? 'Edit your profile details' : 'Your personal information'}
                  </p>
                </div>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => edit.saveEdit()}>
                      <Check className="h-4 w-4 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => edit.cancelEdit()}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => edit.startEdit()}>
                    <Edit2 className="h-4 w-4 mr-1" /> Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={edit.draft.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={edit.draft.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={edit.draft.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={edit.draft.company}
                          onChange={(e) => handleChange('company', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={edit.draft.location}
                          onChange={(e) => handleChange('location', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Department</Label>
                        <Select
                          value={edit.draft.role}
                          onValueChange={(v) => handleChange('role', v)}
                        >
                          <SelectTrigger id="role">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Engineering">Engineering</SelectItem>
                            <SelectItem value="Design">Design</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                            <SelectItem value="HR">HR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={edit.draft.bio}
                        onChange={(e) => handleChange('bio', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  // Read Mode
                  <div className="space-y-6">
                    {/* Avatar and Name */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
                        {profile.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{profile.name}</h3>
                        <p className="text-sm text-muted-foreground">{profile.role}</p>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm">{profile.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="text-sm">{profile.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Building className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Company</p>
                          <p className="text-sm">{profile.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="text-sm">{profile.location}</p>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Bio</p>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        {profile.bio}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default EditableCardsShowcasePage;
