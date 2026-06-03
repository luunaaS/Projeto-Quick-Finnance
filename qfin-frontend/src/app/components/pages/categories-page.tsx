import { useEffect, useMemo, useState } from 'react';
import { Tag, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { Card } from '../ui/simple-card';
import { Button } from '../ui/simple-button';
import api from '../../../services/api';

interface Category {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  parentId: number | null;
  isDefault: boolean;
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form de criação
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [creating, setCreating] = useState(false);

  // Edição inline
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getCategories();
      setCategories(
        (data || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          parentId: c.parentId ?? null,
          isDefault: Boolean(c.isDefault),
        }))
      );
    } catch (e: any) {
      setError(parseError(e, 'Erro ao carregar categorias.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const parseError = (e: any, fallback: string) => {
    const msg = e?.message || '';
    try {
      const parsed = JSON.parse(msg);
      return parsed.error || fallback;
    } catch {
      return msg || fallback;
    }
  };

  const incomeCategories = useMemo(() => categories.filter((c) => c.type === 'INCOME'), [categories]);
  const expenseCategories = useMemo(() => categories.filter((c) => c.type === 'EXPENSE'), [categories]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!newName.trim()) {
      setError('Informe o nome da categoria.');
      return;
    }

    setCreating(true);
    try {
      await api.createCategory({ name: newName.trim(), type: newType });
      setNewName('');
      setMessage('Categoria criada com sucesso.');
      await loadCategories();
    } catch (e: any) {
      setError(parseError(e, 'Erro ao criar categoria.'));
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setError('');
    setMessage('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleUpdate = async (cat: Category) => {
    if (!editName.trim()) {
      setError('O nome da categoria não pode ficar vazio.');
      return;
    }
    setError('');
    setMessage('');
    try {
      await api.updateCategory(cat.id, { name: editName.trim(), parentId: cat.parentId });
      setMessage('Categoria atualizada com sucesso.');
      cancelEdit();
      await loadCategories();
    } catch (e: any) {
      setError(parseError(e, 'Erro ao atualizar categoria.'));
    }
  };

  const handleDelete = async (cat: Category) => {
    const confirmed = window.confirm(`Tem certeza que deseja excluir a categoria "${cat.name}"?`);
    if (!confirmed) return;

    setError('');
    setMessage('');
    try {
      await api.deleteCategory(cat.id);
      setMessage('Categoria excluída com sucesso.');
      await loadCategories();
    } catch (e: any) {
      setError(parseError(e, 'Erro ao excluir categoria.'));
    }
  };

  const renderCategoryList = (list: Category[], color: string) => (
    <div className="space-y-2">
      {list.length === 0 && (
        <p className="text-sm" style={{ color: '#6B7280' }}>Nenhuma categoria cadastrada.</p>
      )}
      {list.map((cat) => (
        <div
          key={cat.id}
          className="flex items-center justify-between gap-2 p-3 rounded-lg border"
          style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}
        >
          {editingId === cat.id ? (
            <>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 px-2 py-1 border rounded-md text-sm"
                style={{ borderColor: '#D1D5DB' }}
                autoFocus
              />
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleUpdate(cat)}
                  style={{ backgroundColor: '#059669', color: 'white' }}
                  className="hover:opacity-90"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={cancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-sm font-medium" style={{ color: '#374151' }}>{cat.name}</span>
                {cat.isDefault && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#E5E7EB', color: '#6B7280' }}
                  >
                    Padrão
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => startEdit(cat)}
                  disabled={cat.isDefault}
                  title={cat.isDefault ? 'Categorias padrão não podem ser editadas' : 'Editar'}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleDelete(cat)}
                  disabled={cat.isDefault}
                  style={cat.isDefault ? undefined : { backgroundColor: '#DC2626', color: 'white' }}
                  variant={cat.isDefault ? 'outline' : 'default'}
                  className="hover:opacity-90"
                  title={cat.isDefault ? 'Categorias padrão não podem ser excluídas' : 'Excluir'}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#1E3A8A' }}>Categorias</h1>
        <p style={{ color: '#6B7280' }}>
          Crie e personalize suas próprias categorias de receitas e despesas.
        </p>
      </div>

      {message && (
        <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#DCFCE7', color: '#166534' }}>
          {message}
        </div>
      )}
      {error && (
        <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
          {error}
        </div>
      )}

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="h-5 w-5" style={{ color: '#1E3A8A' }} />
          <h2 className="text-lg font-semibold" style={{ color: '#1E3A8A' }}>Nova Categoria</h2>
        </div>
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              style={{ borderColor: '#D1D5DB' }}
              placeholder="Ex: Pets, Viagem, Bônus..."
              disabled={creating}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as 'INCOME' | 'EXPENSE')}
              className="w-full px-3 py-2 border rounded-lg"
              style={{ borderColor: '#D1D5DB' }}
              disabled={creating}
            >
              <option value="EXPENSE">Despesa</option>
              <option value="INCOME">Receita</option>
            </select>
          </div>
          <Button
            type="submit"
            style={{ backgroundColor: '#1E3A8A', color: 'white' }}
            className="hover:opacity-90"
            disabled={creating}
          >
            {creating ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </form>
      </Card>

      {loading ? (
        <p className="text-sm" style={{ color: '#6B7280' }}>Carregando categorias...</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-5 w-5" style={{ color: '#059669' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#059669' }}>Receitas</h2>
            </div>
            {renderCategoryList(incomeCategories, '#059669')}
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-5 w-5" style={{ color: '#DC2626' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#DC2626' }}>Despesas</h2>
            </div>
            {renderCategoryList(expenseCategories, '#DC2626')}
          </Card>
        </div>
      )}
    </div>
  );
}
