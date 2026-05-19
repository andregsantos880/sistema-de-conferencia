import React from 'react';
// import { Card } from '@/shared/ui/shadcn/components/ui/card';
import SettingsNav from '../components/SettingsNav';
import { Outlet } from 'react-router';
import PageHeader from '@/shared/ui/components/PageHeader';
import { useTranslation } from 'react-i18next';

const SettingsLayout: React.FC = () => {
  const { t } = useTranslation('settings');
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('title')}
        subtitle={t('description')}
      />

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <SettingsNav className='h-fit sticky lg:top-24 lg:w-64 p-3 lg:p-6' />

        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
