import { Bell, Check, X, Settings, Calendar, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card } from '../ui/simple-card';
import { Button } from '../ui/simple-button';
import api from '../../../services/api';

interface Notification {
  id: string;
  type: 'bill' | 'budget' | 'goal' | 'suspicious';
  title: string;
  description: string;
  date: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface NotificationSettings {
  billReminders: boolean;
  budgetAlerts: boolean;
  goalUpdates: boolean;
  suspiciousActivity: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  reminderDays: number;
}

export function NotificationsPage() {
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    billReminders: true, budgetAlerts: true, goalUpdates: true, suspiciousActivity: true,
    emailNotifications: true, pushNotifications: false, inAppNotifications: true, reminderDays: 3
  });

  useEffect(() => { loadNotifications(); loadSettings(); }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.map((n: any) => ({
        id: n.id.toString(), type: n.type.toLowerCase() as Notification['type'],
        title: n.title, description: n.description, date: n.date,
        isRead: n.isRead, priority: n.priority.toLowerCase() as Notification['priority'],
      })));
    } catch (error) { console.error('Error loading notifications:', error); }
  };

  const loadSettings = async () => {
    try {
      const data = await api.getNotificationSettings();
      if (data) setSettings(data);
    } catch (error) { console.error('Error loading settings:', error); }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) { console.error('Error marking as read:', error); }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) { console.error('Error marking all as read:', error); }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) { console.error('Error deleting notification:', error); }
  };

  const saveSettings = async () => {
    try {
      await api.updateNotificationSettings(settings);
      setShowSettings(false);
    } catch (error) { console.error('Error saving settings:', error); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bill': return <Calendar className="h-5 w-5" />;
      case 'budget': return <TrendingUp className="h-5 w-5" />;
      case 'goal': return <Target className="h-5 w-5" />;
      case 'suspicious': return <AlertTriangle className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return '#DC2626';
    if (type === 'goal') return '#059669';
    if (type === 'budget' && priority === 'medium') return '#F59E0B';
    return '#1E3A8A';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#1E3A8A' }}>Notificações</h1>
          <p style={{ color: '#6B7280' }}>Acompanhe alertas e lembretes importantes</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <Check className="h-4 w-4 mr-2" />Marcar todas como lidas
            </Button>
          )}
          <Button onClick={() => setShowSettings(!showSettings)} variant="outline">
            <Settings className="h-4 w-4 mr-2" />Configurações
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#1E3A8A' }}>Configurações de Notificações</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium" style={{ color: '#374151' }}>Tipos de Notificação</h4>
              {[
                { key: 'billReminders', label: 'Lembretes de contas' },
                { key: 'budgetAlerts', label: 'Alertas de orçamento' },
                { key: 'goalUpdates', label: 'Atualizações de metas' },
                { key: 'suspiciousActivity', label: 'Atividade suspeita' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2">
                  <input type="checkbox" checked={(settings as any)[key]} onChange={(e) => setSettings(prev => ({ ...prev, [key]: e.target.checked }))} className="rounded" />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
            <div className="space-y-3">
              <h4 className="font-medium" style={{ color: '#374151' }}>Canais</h4>
              {[
                { key: 'emailNotifications', label: 'E-mail' },
                { key: 'pushNotifications', label: 'Push' },
                { key: 'inAppNotifications', label: 'In-app' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2">
                  <input type="checkbox" checked={(settings as any)[key]} onChange={(e) => setSettings(prev => ({ ...prev, [key]: e.target.checked }))} className="rounded" />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1">Antecedência de lembretes (dias)</label>
                <input type="number" min="1" max="30" value={settings.reminderDays} onChange={(e) => setSettings(prev => ({ ...prev, reminderDays: Number(e.target.value) }))} className="w-20 px-3 py-2 border rounded-lg" style={{ borderColor: '#D1D5DB' }} />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={saveSettings} style={{ backgroundColor: '#1E3A8A', color: 'white' }} className="hover:opacity-90">Salvar Configurações</Button>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm" style={{ color: '#6B7280' }}>Não lidas</p><p className="text-2xl font-bold" style={{ color: '#DC2626' }}>{unreadCount}</p></div>
            <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}><Bell className="h-5 w-5" style={{ color: '#DC2626' }} /></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm" style={{ color: '#6B7280' }}>Alta prioridade</p><p className="text-2xl font-bold" style={{ color: '#DC2626' }}>{notifications.filter(n => n.priority === 'high').length}</p></div>
            <AlertTriangle className="h-8 w-8" style={{ color: '#DC2626', opacity: 0.2 }} />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm" style={{ color: '#6B7280' }}>Contas próximas</p><p className="text-2xl font-bold" style={{ color: '#F59E0B' }}>{notifications.filter(n => n.type === 'bill').length}</p></div>
            <Calendar className="h-8 w-8" style={{ color: '#F59E0B', opacity: 0.2 }} />
          </div>
        </Card>
      </div>

      {/* Notification List */}
      <Card className="divide-y">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="h-12 w-12 mx-auto mb-4" style={{ color: '#6B7280', opacity: 0.3 }} />
            <p style={{ color: '#6B7280' }}>Nenhuma notificação no momento</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id} className={`p-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50/30' : ''}`}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${getNotificationColor(notification.type, notification.priority)}20`, color: getNotificationColor(notification.type, notification.priority) }}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold" style={{ color: '#1E3A8A' }}>{notification.title}</h4>
                        {!notification.isRead && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#DC2626' }} />}
                      </div>
                      <p className="text-sm mb-2" style={{ color: '#6B7280' }}>{notification.description}</p>
                      <p className="text-xs" style={{ color: '#6B7280' }}>
                        {new Date(notification.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <button onClick={() => markAsRead(notification.id)} className="p-2 rounded-lg hover:bg-gray-200 transition-colors" title="Marcar como lida">
                          <Check className="h-4 w-4" style={{ color: '#059669' }} />
                        </button>
                      )}
                      <button onClick={() => deleteNotification(notification.id)} className="p-2 rounded-lg hover:bg-gray-200 transition-colors" title="Remover">
                        <X className="h-4 w-4" style={{ color: '#DC2626' }} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
