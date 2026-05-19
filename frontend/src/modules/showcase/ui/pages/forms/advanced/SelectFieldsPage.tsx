import React from 'react';
import { ShowcasePage, ShowcaseSection } from '../../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { FieldGroup } from '@/shared/ui/shadcn/components/ui/field';
import {
  SelectItem,
  SelectGroup,
  SelectLabel,
} from '@/shared/ui/shadcn/components/ui/select';
import FieldSelect from '@/components/forms/composites/field/FieldSelect';
import { SearchSelectDemo, MultiSelectDemo, AsyncSelectDemo } from '../demos/SelectDemos';

const SelectFieldsPage: React.FC = () => {
  return (
    <ShowcasePage
      title="Select Fields"
      description="Comprehensive selection components including searchable, multi-select, and async variants."
    >
      <ShowcaseSection
        title="Select Variants"
        description="Standard and advanced selection components."
        className="grid gap-6 lg:grid-cols-2"
      >
        {/* FieldSelect */}
        <CodeExample
            id="field-select-groups"
            title="FieldSelect (Grouped)"
            description="Select component with categorized options using SelectGroup."
            spotlight="cyan"
            code={`<FieldSelect label="Framework">
  <SelectGroup>
    <SelectLabel>Frontend</SelectLabel>
    <SelectItem value="react">React</SelectItem>
    <SelectItem value="vue">Vue</SelectItem>
  </SelectGroup>
  <SelectGroup>
    <SelectLabel>Backend</SelectLabel>
    <SelectItem value="node">Node.js</SelectItem>
  </SelectGroup>
  </FieldSelect>`}
        >
            <FieldGroup className="w-full">
                <FieldSelect 
                  label="Tech Stack"
                  placeholder="Select technology..."
                  defaultValue="react"
                  required
                >
                  <SelectGroup>
                    <SelectLabel>Frontend</SelectLabel>
                    <SelectItem value="react">React</SelectItem>
                    <SelectItem value="vue">Vue</SelectItem>
                    <SelectItem value="angular">Angular</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Backend</SelectLabel>
                    <SelectItem value="node">Node.js</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Database</SelectLabel>
                    <SelectItem value="postgres">PostgreSQL</SelectItem>
                    <SelectItem value="mongo">MongoDB</SelectItem>
                  </SelectGroup>
                </FieldSelect>
            </FieldGroup>
        </CodeExample>

        <CodeExample
          id="field-search-select"
          title="FieldSearchSelect"
          description="Single select with search functionality."
          code={`<FieldSearchSelect 
  label="Searchable Select"
  placeholder="Select a framework..."
  options={FRAMEWORKS}
  value={value}
  onChange={setValue}
/>`}
        >
          <SearchSelectDemo />
        </CodeExample>

        <CodeExample
          id="field-multi-select"
          title="FieldMultiSelect"
          description="Multi-select with tag display."
          code={`<FieldMultiSelect 
  label="Multi-Select"
  placeholder="Select options..."
  options={OPTIONS}
  value={values}
  onChange={setValues}
/>`}
        >
          <MultiSelectDemo />
        </CodeExample>

        <CodeExample
          id="field-async-select"
          title="FieldAsyncSelect"
          description="Async loading options from remote source."
          code={`<FieldAsyncSelect 
  label="Async Search"
  loadOptions={loadOptions}
  value={value}
  onChange={setValue}
/>`}
        >
          <AsyncSelectDemo />
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default SelectFieldsPage;
