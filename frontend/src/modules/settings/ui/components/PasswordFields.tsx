import React from 'react';
import { useTranslation } from 'react-i18next';
import FieldText from '@/components/forms/composites/field/FieldText';

const PasswordFields: React.FC = () => {
  const { t } = useTranslation('settings');
  return (
    <div className="space-y-3">
      <FieldText type="password" placeholder={t('account.password.current_placeholder')} label={t('account.password.current')} />
      <FieldText type="password" placeholder={t('account.password.new_placeholder')} label={t('account.password.new')} />
      <FieldText type="password" placeholder={t('account.password.confirm_placeholder')} label={t('account.password.confirm')} />
    </div>
  );
};

export default PasswordFields;
