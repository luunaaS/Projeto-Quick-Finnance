import { useEffect, useMemo, useRef, useState } from 'react';
import { User, Lock, Camera, Trash2, Bell } from 'lucide-react';
import { Card } from '../ui/simple-card';
import { Button } from '../ui/simple-button';
import api from '../../../services/api';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  bio: string;
  birthDate: string;
  profileImageBase64: string | null;
}

interface ProfilePageProps {
  currentUser: UserProfile;
  onUserUpdated: (user: UserProfile) => void;
}

export function ProfilePage({ currentUser, onUserUpdated }: ProfilePageProps) {
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    bio: currentUser.bio || '',
    birthDate: currentUser.birthDate || '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(currentUser.profileImageBase64 || null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [photoMessage, setPhotoMessage] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    recurringTransactionReminders: true,
    financingPaymentReminders: true,
    goalProgressUpdates: true,
  });
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationError, setNotificationError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setProfileForm({
      name: currentUser.name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      bio: currentUser.bio || '',
      birthDate: currentUser.birthDate || '',
    });
    setProfileImage(currentUser.profileImageBase64 || null);
  }, [currentUser]);

  const loadProfile = async () => {
    try {
      const data = await api.getProfile();
      onUserUpdated({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        bio: data.bio || '',
        birthDate: data.birthDate || '',
        profileImageBase64: data.profileImageBase64 || null,
      });
      setProfileImage(data.profileImageBase64 || null);
    } catch (error: any) {
      setProfileError(error?.message || 'Erro ao carregar perfil.');
    }
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => !phone || /^[0-9()+\-\s]{8,20}$/.test(phone);
  const validateBirthDate = (birthDate: string) => {
    if (!birthDate) return true;
    const date = new Date(`${birthDate}T00:00:00`);
    const now = new Date();
    return !Number.isNaN(date.getTime()) && date <= now;
  };

  const profileIsDirty = useMemo(
    () =>
      profileForm.name !== (currentUser.name || '') ||
      profileForm.email !== (currentUser.email || '') ||
      profileForm.phone !== (currentUser.phone || '') ||
      profileForm.bio !== (currentUser.bio || '') ||
      profileForm.birthDate !== (currentUser.birthDate || ''),
    [profileForm, currentUser]
  );

  const handleResetProfileForm = () => {
    setProfileForm({
      name: currentUser.name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      bio: currentUser.bio || '',
      birthDate: currentUser.birthDate || '',
    });
    setProfileError('');
    setProfileMessage('');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileMessage('');

    if (!profileForm.name.trim()) {
      setProfileError('Nome é obrigatório.');
      return;
    }

    if (!validateEmail(profileForm.email)) {
      setProfileError('Informe um email válido.');
      return;
    }

    if (!validatePhone(profileForm.phone)) {
      setProfileError('Telefone inválido. Use apenas números e símbolos comuns.');
      return;
    }

    if (!validateBirthDate(profileForm.birthDate)) {
      setProfileError('Data de nascimento inválida.');
      return;
    }

    if (profileForm.bio.length > 280) {
      setProfileError('A bio deve ter no máximo 280 caracteres.');
      return;
    }

    setProfileLoading(true);
    try {
      const res = await api.updateProfileDetails({
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim() || undefined,
        bio: profileForm.bio.trim() || undefined,
        birthDate: profileForm.birthDate || undefined,
      });
      onUserUpdated({
        name: res.user.name,
        email: res.user.email,
        phone: res.user.phone || '',
        bio: res.user.bio || '',
        birthDate: res.user.birthDate || '',
        profileImageBase64: res.user.profileImageBase64 || null,
      });
      setProfileMessage('Perfil atualizado com sucesso.');
    } catch (error: any) {
      setProfileError(error?.message || 'Erro ao atualizar perfil.');
    } finally {
      setProfileLoading(false);
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

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordMessage('Senha alterada com sucesso.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setPasswordError(error?.message || 'Erro ao alterar senha.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoError('');
    setPhotoMessage('');

    if (!file.type.startsWith('image/')) {
      setPhotoError('Selecione um arquivo de imagem válido.');
      return;
    }

    const maxSizeMb = 5;
    if (file.size > maxSizeMb * 1024 * 1024) {
      setPhotoError(`A imagem deve ter no máximo ${maxSizeMb}MB.`);
      return;
    }

    setPhotoLoading(true);
    try {
      const base64 = await readFileAsBase64(file);
      const res = await api.updateProfilePhoto(base64);
      const updated = res.user;
      setProfileImage(updated.profileImageBase64 || null);
      onUserUpdated({
        name: updated.name,
        email: updated.email,
        phone: updated.phone || '',
        bio: updated.bio || '',
        birthDate: updated.birthDate || '',
        profileImageBase64: updated.profileImageBase64 || null,
      });
      setPhotoMessage('Foto de perfil atualizada com sucesso.');
    } catch (error: any) {
      setPhotoError(error?.message || 'Erro ao atualizar foto de perfil.');
    } finally {
      setPhotoLoading(false);
      event.target.value = '';
    }
  };

  const handleDeletePhoto = async () => {
    if (!profileImage) return;

    const confirmed = window.confirm('Tem certeza que deseja excluir sua foto de perfil?');
    if (!confirmed) return;

    setPhotoError('');
    setPhotoMessage('');
    setPhotoLoading(true);
    try {
      const res = await api.deleteProfilePhoto();
      const updated = res.user;
      setProfileImage(null);
      onUserUpdated({
        name: updated.name,
        email: updated.email,
        phone: updated.phone || '',
        bio: updated.bio || '',
        birthDate: updated.birthDate || '',
        profileImageBase64: null,
      });
      setPhotoMessage('Foto de perfil removida com sucesso.');
    } catch (error: any) {
      setPhotoError(error?.message || 'Erro ao remover foto de perfil.');
    } finally {
      setPhotoLoading(false);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const data = await api.getNotificationSettings();
      setNotificationSettings({
        emailNotifications: Boolean(data?.emailNotifications),
        pushNotifications: Boolean(data?.pushNotifications),
        recurringTransactionReminders: Boolean(data?.recurringTransactionReminders),
        financingPaymentReminders: Boolean(data?.financingPaymentReminders),
        goalProgressUpdates: Boolean(data?.goalProgressUpdates),
      });
    } catch (error: any) {
      setNotificationError(error?.message || 'Erro ao carregar configurações de notificação.');
    }
  };

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotificationError('');
    setNotificationMessage('');
    setNotificationLoading(true);
    try {
      await api.updateNotificationSettings(notificationSettings);
      setNotificationMessage('Configurações de notificação atualizadas com sucesso.');
    } catch (error: any) {
      setNotificationError(error?.message || 'Erro ao atualizar configurações de notificação.');
    } finally {
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    loadNotificationSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#1E3A8A' }}>
          Perfil do Usuário
        </h1>
        <p style={{ color: '#6B7280' }}>
          Atualize seus dados pessoais, foto de perfil e credenciais de acesso.
        </p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Foto de perfil"
                className="h-24 w-24 rounded-full object-cover border"
                style={{ borderColor: '#D1D5DB' }}
              />
            ) : (
              <div
                className="h-24 w-24 rounded-full flex items-center justify-center border"
                style={{ borderColor: '#D1D5DB', backgroundColor: '#F3F4F6' }}
              >
                <User className="h-10 w-10" style={{ color: '#6B7280' }} />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <h2 className="text-lg font-semibold" style={{ color: '#1E3A8A' }}>
              Foto de Perfil
            </h2>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Adicione, troque ou remova sua foto de perfil.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="hover:opacity-90"
                style={{ backgroundColor: '#1E3A8A', color: 'white' }}
                disabled={photoLoading}
              >
                <Camera className="h-4 w-4 mr-2" />
                {profileImage ? 'Trocar Foto' : 'Adicionar Foto'}
              </Button>
              <Button
                type="button"
                onClick={handleDeletePhoto}
                className="hover:opacity-90"
                style={{ backgroundColor: '#DC2626', color: 'white' }}
                disabled={!profileImage || photoLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {photoLoading ? 'Processando...' : 'Excluir Foto'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={photoLoading}
              />
            </div>
            {photoMessage && (
              <div className="p-2 rounded text-sm" style={{ backgroundColor: '#DCFCE7', color: '#166534' }}>
                {photoMessage}
              </div>
            )}
            {photoError && (
              <div className="p-2 rounded text-sm" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                {photoError}
              </div>
            )}
          </div>
        </div>
      </Card>

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
                disabled={profileLoading}
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
                disabled={profileLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                style={{ borderColor: '#D1D5DB' }}
                placeholder="(00) 00000-0000"
                disabled={profileLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data de Nascimento</label>
              <input
                type="date"
                value={profileForm.birthDate}
                onChange={(e) => setProfileForm((p) => ({ ...p, birthDate: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                style={{ borderColor: '#D1D5DB' }}
                disabled={profileLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                value={profileForm.bio}
                onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                style={{ borderColor: '#D1D5DB' }}
                rows={4}
                placeholder="Conte um pouco sobre você..."
                disabled={profileLoading}
              />
              <p className="text-xs mt-1" style={{ color: profileForm.bio.length > 280 ? '#DC2626' : '#6B7280' }}>
                {profileForm.bio.length}/280
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                onClick={handleResetProfileForm}
                className="hover:opacity-90"
                style={{ backgroundColor: '#6B7280', color: 'white' }}
                disabled={!profileIsDirty || profileLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                style={{ backgroundColor: '#1E3A8A', color: 'white' }}
                className="hover:opacity-90"
                disabled={profileLoading}
              >
                {profileLoading ? 'Salvando...' : 'Salvar Perfil'}
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
                disabled={passwordLoading}
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
                disabled={passwordLoading}
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
                disabled={passwordLoading}
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                style={{ backgroundColor: '#1E3A8A', color: 'white' }}
                className="hover:opacity-90"
                disabled={passwordLoading}
              >
                {passwordLoading ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5" style={{ color: '#1E3A8A' }} />
          <h2 className="text-lg font-semibold" style={{ color: '#1E3A8A' }}>Configurações de Notificação</h2>
        </div>

        {notificationMessage && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#DCFCE7', color: '#166534' }}>
            {notificationMessage}
          </div>
        )}
        {notificationError && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
            {notificationError}
          </div>
        )}

        <form onSubmit={handleNotificationSubmit} className="space-y-4">
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm">Notificações por email</span>
            <input
              type="checkbox"
              checked={notificationSettings.emailNotifications}
              onChange={(e) => setNotificationSettings((p) => ({ ...p, emailNotifications: e.target.checked }))}
              disabled={notificationLoading}
            />
          </label>

          <label className="flex items-center justify-between gap-3">
            <span className="text-sm">Notificações push</span>
            <input
              type="checkbox"
              checked={notificationSettings.pushNotifications}
              onChange={(e) => setNotificationSettings((p) => ({ ...p, pushNotifications: e.target.checked }))}
              disabled={notificationLoading}
            />
          </label>

          <label className="flex items-center justify-between gap-3">
            <span className="text-sm">Lembretes de transações recorrentes</span>
            <input
              type="checkbox"
              checked={notificationSettings.recurringTransactionReminders}
              onChange={(e) => setNotificationSettings((p) => ({ ...p, recurringTransactionReminders: e.target.checked }))}
              disabled={notificationLoading}
            />
          </label>

          <label className="flex items-center justify-between gap-3">
            <span className="text-sm">Lembretes de pagamento de financiamento</span>
            <input
              type="checkbox"
              checked={notificationSettings.financingPaymentReminders}
              onChange={(e) => setNotificationSettings((p) => ({ ...p, financingPaymentReminders: e.target.checked }))}
              disabled={notificationLoading}
            />
          </label>

          <label className="flex items-center justify-between gap-3">
            <span className="text-sm">Atualizações de progresso de metas</span>
            <input
              type="checkbox"
              checked={notificationSettings.goalProgressUpdates}
              onChange={(e) => setNotificationSettings((p) => ({ ...p, goalProgressUpdates: e.target.checked }))}
              disabled={notificationLoading}
            />
          </label>

          <div className="flex justify-end">
            <Button
              type="submit"
              style={{ backgroundColor: '#1E3A8A', color: 'white' }}
              className="hover:opacity-90"
              disabled={notificationLoading}
            >
              {notificationLoading ? 'Salvando...' : 'Salvar Notificações'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
