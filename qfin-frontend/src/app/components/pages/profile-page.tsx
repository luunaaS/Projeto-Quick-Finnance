import { useState } from 'react';
import { User, Lock } from 'lucide-react';
import { Card } from '../ui/simple-card';
import { Button } from '../ui/simple-button';
import api from '../../../services/api';

interface ProfilePageProps {
  currentUser: {
    name: string;
    email: string;
  };
  onUserUpdated: (user: { name: string; email: string }) => void;
}

export function ProfilePage({ currentUser, onUserUpdated }: ProfilePageProps) {
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileMessage('');
    try {
      const res = await api.updateProfile(profileForm.name, profileForm.email);
      onUserUpdated({ name: res.user.name, email: res.user.email });
      setProfileMessage('Perfil atualizado com sucesso.');
    } catch (error: any) {
      setProfileError(error?.message || 'Erro ao atualizar perfil.');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('A confirmação da nova senha não confere.');
      return;
    }

    try {
      await api.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordMessage('Senha alterada com sucesso.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setPasswordError(error?.message || 'Erro ao alterar senha.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#1E3A8A' }}>
          Perfil do Usuário
        </h1>
        <p style={{ color: '#6B7280' }}>
          Atualize seus dados pessoais e credenciais de acesso.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5" style={{ color: '#1E3A8A' }} />
            <h2 className="text-lg font-semibold" style={{ color: '#1E3A8A' }}>Dados do Perfil</h2>
          </div>

          {profileMessage && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#DCFCE7', color: '#166534' }}>
              {profileMessage}
            </div>
          )}
          {profileError && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
              {profileError}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                style={{ borderColor: '#D1D5DB' }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                style={{ borderColor: '#D1D5DB' }}
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" style={{ backgroundColor: '#1E3A8A', color: 'white' }} className="hover:opacity-90">
                Salvar Perfil
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5" style={{ color: '#1E3A8A' }} />
            <h2 className="text-lg font-semibold" style={{ color: '#1E3A8A' }}>Alterar Senha</h2>
          </div>

          {passwordMessage && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#DCFCE7', color: '#166534' }}>
              {passwordMessage}
            </div>
          )}
          {passwordError && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Senha Atual</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                style={{ borderColor: '#D1D5DB' }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nova Senha</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                style={{ borderColor: '#D1D5DB' }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirmar Nova Senha</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                style={{ borderColor: '#D1D5DB' }}
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" style={{ backgroundColor: '#1E3A8A', color: 'white' }} className="hover:opacity-90">
                Alterar Senha
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
