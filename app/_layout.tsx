import { Stack } from 'expo-router';
import * as Notifications from "expo-notifications";
import { View } from 'react-native';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import CustomizeActionSheet from './components/CustomizeActionSheet';

import { ActionSheetProvider, useActionSheet } from '@/contexts/ActionSheetContext';
import { DrawerProvider, useDrawer } from '@/contexts/DrawerContext';
import CustomizeDrawer from './components/CustomizeDrawer';
import '../firebaseConfig'
import { PortalProvider } from '@gluestack-ui/core/lib/esm/overlay/aria';

import { ModalProvider, useModal } from '@/contexts/ModalContext';
import CustomizeModal from './components/CustomizeModal';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function RootLayoutContent() {
  const { isOpen, closeActionSheet, body } = useActionSheet();
  const { isOpen: isDrawerOpen, closeDrawer, body: drawerBody } = useDrawer();
  const { isOpen: isModalOpen, closeModal, body: modalBody } = useModal();

  return (
    <View style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <CustomizeActionSheet children={body} isOpen={isOpen} onClose={closeActionSheet} />
      <CustomizeDrawer children={drawerBody} isOpen={isDrawerOpen} onClose={closeDrawer} />
      <CustomizeModal children={modalBody} isOpen={isModalOpen} onClose={closeModal} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="dark">
      <PortalProvider>
        <ActionSheetProvider>
          <DrawerProvider>
            <ModalProvider>
              <RootLayoutContent />
            </ModalProvider>
          </DrawerProvider>
        </ActionSheetProvider>
      </PortalProvider>
    </GluestackUIProvider>
  );
}
