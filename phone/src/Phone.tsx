import React, { Dispatch, SetStateAction, useEffect } from 'react';
import './Phone.css';
import { Route } from 'react-router-dom';
import { CallModal } from '@os/call/components/CallModal';
import { HomeApp } from './apps/home/components/Home';
import { Navigation } from '@os/navigation-bar/components/Navigation';
import { useSimcardService } from '@os/simcard/hooks/useSimcardService';
import { usePhoneService } from '@os/phone/hooks/usePhoneService';
import { useApps } from '@os/apps/hooks/useApps';
import { useTwitterService } from './apps/twitter/hooks/useTwitterService';
import { useMarketplaceService } from './apps/marketplace/hooks/useMarketplaceService';
import { useBankService } from './apps/bank/hooks/useBankService';
import { useMessagesService } from './apps/messages/hooks/useMessageService';
import { useSettings } from './apps/settings/hooks/useSettings';
import { useCallService } from '@os/call/hooks/useCallService';
import { useDialService } from './apps/dialer/hooks/useDialService';
import InjectDebugData from './os/debug/InjectDebugData';
import { useCallModal } from '@os/call/hooks/useCallModal';
import WindowSnackbar from './ui/components/WindowSnackbar';
import { useTranslation } from 'react-i18next';
import { PhoneEvents } from '@typings/phone';
import PhoneWrapper from './PhoneWrapper';
import dayjs from 'dayjs';
import DefaultConfig from '../../config.json';
import { TopLevelErrorComponent } from '@ui/components/TopLevelErrorComponent';
import { useConfig } from '@os/phone/hooks/useConfig';
import { useContactsListener } from './apps/contacts/hooks/useContactsListener';
import { useNoteListener } from './apps/notes/hooks/useNoteListener';
import { useNotificationListener } from '@os/new-notifications/hooks/useNotificationListener';
import { PhoneSnackbar } from '@os/snackbar/components/PhoneSnackbar';
import { NotificationBar } from '@os/new-notifications/components/NotificationBar';
import { useInvalidSettingsHandler } from './apps/settings/hooks/useInvalidSettingsHandler';
import { useKeyboardService } from '@os/keyboard/hooks/useKeyboardService';

interface PhoneProps {
  notiRefCB: Dispatch<SetStateAction<HTMLElement>>;
}

export const Phone: React.FC<PhoneProps> = ({ notiRefCB }) => {
  const { i18n } = useTranslation();

  const { apps } = useApps();

  const [settings] = useSettings();

  // Set language from local storage
  // This will only trigger on first mount & settings changes
  useEffect(() => {
    i18n.changeLanguage(settings.language.value).catch((e) => console.error(e));
  }, [i18n, settings.language]);

  useConfig();
  useKeyboardService();
  usePhoneService();
  useSimcardService();
  useTwitterService();
  useMarketplaceService();
  useBankService();
  useMessagesService();
  useContactsListener();
  useNoteListener();
  useNotificationListener();
  useCallService();
  useDialService();
  useInvalidSettingsHandler();

  const { modal: callModal } = useCallModal();

  return (
    <div>
      <TopLevelErrorComponent>
        <WindowSnackbar />
        <PhoneWrapper>
          <NotificationBar />
          <div className="PhoneAppContainer" ref={notiRefCB}>
            <>
              <Route exact path="/" component={HomeApp} />
              {callModal && <Route exact path="/call" component={CallModal} />}
              {apps.map((App) => (
                <>{!App.isDisabled && <App.Route key={App.id} />}</>
              ))}
            </>
            <PhoneSnackbar />
          </div>
          <Navigation />
        </PhoneWrapper>
      </TopLevelErrorComponent>
    </div>
  );
};

export default Phone;

InjectDebugData<any>([
  {
    app: 'PHONE',
    method: PhoneEvents.SET_VISIBILITY,
    data: true,
  },
  {
    app: 'PHONE',
    method: PhoneEvents.SET_PHONE_READY,
    data: true,
  },
  {
    app: 'PHONE',
    method: PhoneEvents.SET_TIME,
    data: dayjs().format('hh:mm'),
  },
  {
    app: 'PHONE',
    method: PhoneEvents.SET_CONFIG,
    data: DefaultConfig,
  },
]);
