type SectionHeaderProps = {
    title: string;
    description?: string;
}

export const SectionHeader = ({title, description}: SectionHeaderProps) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
      {title}
    </h3>
    {description && (
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        {description}
      </p>
    )}
  </div>
);
