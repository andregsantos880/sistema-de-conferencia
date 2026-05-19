import React from 'react';
import NavRail, { type NavRailItem } from '@/shared/ui/components/navigation/NavRail';
import { useTranslation } from 'react-i18next';
import { getSettingsRoutes } from '../routes';
import { User, Settings as SettingsIcon, CreditCard, Shield, AppWindow, Bell, Palette } from 'lucide-react';

type Props = {
  className?: string;
};

const SettingsNav: React.FC<Props> = ({ className }) => {
  const { t } = useTranslation('settings');

  const items: NavRailItem[] = React.useMemo(() => {
    const routes = getSettingsRoutes();
    const root = routes[0];
    const children = root?.children ?? [];

    const iconFor = (segment: string) => {
      switch (segment) {
        case 'profile': return <User className="size-5" />;
        case 'account': return <SettingsIcon className="size-5" />;
        case 'billing': return <CreditCard className="size-5" />;
        case 'security': return <Shield className="size-5" />;
        case 'apps': return <AppWindow className="size-5" />;
        case 'notifications': return <Bell className="size-5" />;
        case 'preferences': return <Palette className="size-5" />;
        default: return <User className="size-5" />;
      }
    };

    return children
      .filter(r => !r.index && !!r.path)
      .map<NavRailItem>((r) => {
        const path = r.path;
        const segment = path?.split('/').pop() ?? '';
        const label = r.titleKey ? t(r.titleKey) : (r.title ?? segment);

        return {
          id: segment,
          to: path,
          icon: iconFor(segment),
          label,
        };
      });
  }, [t]);

  return (
    <NavRail
      items={items}
      ariaLabel={t('nav.aria','Settings navigation')}
      mobileContent="icons"
      variant="responsive"
      breakpoint="lg"
      size="md"
      className={className}
    />
  );
};

export default SettingsNav;
