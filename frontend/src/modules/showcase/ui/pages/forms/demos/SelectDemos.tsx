import { useState } from 'react';
import { FieldSearchSelect, FieldMultiSelect, FieldAsyncSelect } from '@/components/forms/composites/field';
import type { SelectOption } from '@/components/forms/composites/field/select/types';

// Mock data
const FRAMEWORKS: SelectOption[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'nextjs', label: 'Next.js' },
  { value: 'nuxt', label: 'Nuxt' },
];

const LANGUAGES: SelectOption[] = [
  { value: 'js', label: 'JavaScript' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'py', label: 'Python' },
  { value: 'go', label: 'Go' },
  { value: 'rs', label: 'Rust' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'php', label: 'PHP' },
  { value: 'rb', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kt', label: 'Kotlin' },
  { value: 'dart', label: 'Dart' },
  { value: 'scala', label: 'Scala' },
  { value: 'hs', label: 'Haskell' },
  { value: 'lua', label: 'Lua' },
  { value: 'ex', label: 'Elixir' },
  { value: 'clj', label: 'Clojure' },
  { value: 'r', label: 'R' },
];

// Async mock
const loadOptions = (inputValue: string): Promise<SelectOption[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = LANGUAGES.filter((i) =>
        i.label.toLowerCase().includes(inputValue.toLowerCase())
      );
      resolve(filtered);
    }, 1000);
  });
};

export const SearchSelectDemo = () => {
  const [value, setValue] = useState<string | undefined>('react');

  return (
    <div className="space-y-4">
      <FieldSearchSelect 
        label="Searchable Select"
        placeholder="Select a framework..."
        options={FRAMEWORKS}
        value={value}
        onChange={setValue}
        helperText="Try searching for 'React' or 'Vue'"
      />
      <div className="text-xs text-muted-foreground">
        Selected Value: <code className="bg-muted px-1 rounded">{value || 'None'}</code>
      </div>
    </div>
  );
};

export const MultiSelectDemo = () => {
  const [values, setValues] = useState<string[]>(['react', 'ts']);

  return (
    <div className="space-y-4">
      <FieldMultiSelect 
        label="Multi-Select"
        placeholder="Select options..."
        options={[...FRAMEWORKS, ...LANGUAGES]}
        value={values}
        onChange={setValues}
        helperText="Select multiple technologies"
      />
      <div className="text-xs text-muted-foreground">
        Selected: {values.length ? values.map(v => <code key={v} className="bg-muted px-1 rounded mr-1">{v}</code>) : 'None'}
      </div>
    </div>
  );
};

export const AsyncSelectDemo = () => {
  const [value, setValue] = useState<string | undefined>();

  return (
    <div className="space-y-4">
      <FieldAsyncSelect 
        label="Async Search"
        placeholder="Type to search languages..."
        loadOptions={loadOptions}
        value={value}
        onChange={setValue}
        helperText="Simulates API call (1s delay). Try 'Java' or 'Rust'"
      />
      <div className="text-xs text-muted-foreground">
        Selected: <code className="bg-muted px-1 rounded">{value || 'None'}</code>
      </div>
    </div>
  );
};
