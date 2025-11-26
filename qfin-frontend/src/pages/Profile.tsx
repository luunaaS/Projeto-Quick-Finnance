import { useState, useEffect } from 'react';
import { Header } from '../components/header';
import { useAuth } from '../contexts/AuthContext';
import { transactionsService } from '../services/transactions.service';
import { financingService } from '../services/financing.service';
import { apiService } from '../services/api.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { User, Mail, Lock, LogOut, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Profile() {
  const { user, logout, token, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [transactionCount, setTransactionCount] = useState(0);
  const [financingCount, setFinancingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
    // Carregar foto de perfil do localStorage
    const savedImage = localStorage.getItem('qfin_profile_image');
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, []);

  const loadStatistics = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const transactions = await transactionsService.getTransactions();
      const financings = await financingService.getAllFinancings();
      
      setTransactionCount(transactions.length);
      setFinancingCount(financings.length);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await updateProfile(name, email);
      
      if (result.success) {
        setIsEditing(false);
        alert('Perfil atualizado com sucesso!');
      } else {
        alert(result.error || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Erro ao atualizar perfil');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      const response = await apiService.changePassword(currentPassword, newPassword);
      
      if (response.success) {
        alert('Senha alterada com sucesso!');
        setIsPasswordDialogOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert(response.error || 'Erro ao alterar senha');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Erro ao alterar senha');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB');
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione uma imagem válida');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
        localStorage.setItem('qfin_profile_image', base64String);
        alert('Foto de perfil atualizada com sucesso!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    localStorage.removeItem('qfin_profile_image');
    alert('Foto de perfil removida com sucesso!');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600 mt-2">Gerencie suas informações pessoais</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card de Perfil */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                {profileImage ? (
                  <AvatarImage src={profileImage} alt={user?.name} />
                ) : (
                  <AvatarFallback className="text-3xl bg-blue-600 text-white">
                    {user ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{user?.name}</h3>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
              <div className="w-full space-y-2">
                <input
                  type="file"
                  id="profile-image"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('profile-image')?.click()}
                >
                  {profileImage ? 'Alterar Foto' : 'Adicionar Foto'}
                </Button>
                {profileImage && (
                  <Button
                    variant="outline"
                    className="w-full text-red-600 hover:bg-red-50"
                    onClick={handleRemoveImage}
                  >
                    Remover Foto
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancelar' : 'Editar Perfil'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Perfil */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                {isEditing ? 'Atualize suas informações' : 'Suas informações cadastradas'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        placeholder="Seu nome completo"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      Salvar Alterações
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Nome</p>
                      <p className="font-medium">{user?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">E-mail</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Lock className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Senha</p>
                      <p className="font-medium">••••••••</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Configurações de Conta */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Conta</CardTitle>
            <CardDescription>Gerencie as configurações da sua conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">Alterar Senha</h4>
                <p className="text-sm text-gray-600">Atualize sua senha periodicamente</p>
              </div>
              <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>
                Alterar
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <h4 className="font-medium text-blue-900">Gerenciar Categorias</h4>
                <p className="text-sm text-blue-700">Crie, edite ou exclua categorias personalizadas</p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/categories')}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Tag className="h-4 w-4 mr-2" />
                Gerenciar
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <h4 className="font-medium text-red-900">Sair da Conta</h4>
                <p className="text-sm text-red-700">Desconectar-se do Quick Finance</p>
              </div>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas da Conta */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas da Conta</CardTitle>
            <CardDescription>Resumo da sua atividade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900 font-medium">Membro desde</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-900 font-medium">Transações Registradas</p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? '...' : transactionCount}
                </p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-900 font-medium">Financiamentos Ativos</p>
                <p className="text-2xl font-bold text-orange-600">
                  {loading ? '...' : financingCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dialog para alterar senha */}
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle style={{ color: '#1E3A8A' }}>Alterar Senha</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pl-10"
                    placeholder="Digite sua senha atual"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10"
                    placeholder="Digite a nova senha"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    placeholder="Confirme a nova senha"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1" style={{ backgroundColor: '#1E3A8A' }}>
                  Alterar Senha
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsPasswordDialogOpen(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
