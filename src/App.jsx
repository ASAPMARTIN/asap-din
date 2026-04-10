import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { PostsProvider } from './hooks/usePosts';
import { BrokersProvider } from './hooks/useBrokers';
import { FollowsProvider } from './hooks/useFollows';
import { MessagesProvider } from './hooks/useMessages';
import { BlockedProvider } from './hooks/useBlocked';

import InviteScreen from './screens/InviteScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import PostDetailScreen from './screens/PostDetailScreen';
import BrokerSearchScreen from './screens/BrokerSearchScreen';
import BrokerProfileScreen from './screens/BrokerProfileScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import ResourcesScreen from './screens/ResourcesScreen';
import ResourceDetailScreen from './screens/ResourceDetailScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SettingsScreen from './screens/SettingsScreen';
import MemberDirectoryScreen from './screens/MemberDirectoryScreen';
import MessagesListScreen from './screens/MessagesListScreen';
import ChatScreen from './screens/ChatScreen';
import PostSearchScreen from './screens/PostSearchScreen';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/invite" element={<InviteScreen />} />
      <Route path="/signup" element={<SignupScreen />} />

      {/* Main app routes */}
      <Route path="/" element={<HomeScreen />} />
      <Route path="/search" element={<BrokerSearchScreen />} />
      <Route path="/search-posts" element={<PostSearchScreen />} />
      <Route path="/members" element={<MemberDirectoryScreen />} />
      <Route path="/profile" element={<UserProfileScreen />} />
      <Route path="/profile/:id" element={<UserProfileScreen />} />
      <Route path="/guias" element={<ResourcesScreen />} />
      <Route path="/guias/:id" element={<ResourceDetailScreen />} />

      {/* Full-page routes (no bottom nav) */}
      <Route path="/post/:id" element={<PostDetailScreen />} />
      <Route path="/broker/:id" element={<BrokerProfileScreen />} />
      <Route path="/notifications" element={<NotificationsScreen />} />
      <Route path="/settings" element={<SettingsScreen />} />
      <Route path="/messages" element={<MessagesListScreen />} />
      <Route path="/messages/:userId" element={<ChatScreen />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BlockedProvider>
          <FollowsProvider>
            <BrokersProvider>
              <PostsProvider>
                <MessagesProvider>
                  <AppRoutes />
                </MessagesProvider>
              </PostsProvider>
            </BrokersProvider>
          </FollowsProvider>
        </BlockedProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
