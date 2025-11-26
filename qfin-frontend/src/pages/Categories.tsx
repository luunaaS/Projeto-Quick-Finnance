import { useState, useEffect } from 'react';
import { Header } from '../components/header';
import { useAuth } from '../contexts/AuthContext';
import { categoriesService } from '../services/categories.service';
import type { Category, CreateCategoryRequest } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Plus, Edit, Trash2, Tag, TrendingUp, TrendingDown } from 'lucide-react';

export function Categories() {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Form states para nova categoria
  const [name, setName] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');

  // Form states para editar categoria
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadCategories();
    }
  }, [isAuthenticated]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !type) return;

    try {
      const newCategory: CreateCategoryRequest = {
        name,
        type,
        parentId: null
      };

      const created = await categoriesService.createCategory(newCategory);
      setCategories(prev => [...prev, created]);
      
      setName('');
      setType('EXPENSE');
      setIsAddOpen(false);
      alert('Categoria criada com sucesso!');
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Erro ao criar categoria');
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setEditName(category.name);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory || !editName) return;

    try {
      const updated = await categoriesService.updateCategory(selectedCategory.id, {
        name: editName,
        parentId: selectedCategory.parentId
      });

      setCategories(prev => prev.map(c => c.id === selectedCategory.id ? updated : c));
      
      setIsEditOpen(false);
      setSelectedCategory(null);
      alert('Categoria atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Erro ao atualizar categoria');
    }
  };

  const handleDelete = async (category: Category) => {
    if (category.isDefault) {
      alert('Não é possível excluir categorias padrão do sistema.');
      return;
    }

    if (confirm(`Deseja realmente excluir a categoria "${category.name}"?`)) {
      try {
        await categoriesService.deleteCategory(category.id);
        setCategories(prev => prev.filter(c => c.id !== category.id));
        alert('Categoria excluída com sucesso!');
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Erro ao excluir categoria');
      }
    }
  };

  const incomeCategories = categories.filter(c => c.type === 'INCOME');
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');
  const customCategories = categories.filter(c => !c.isDefault);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Categorias</h1>
            <p className="text-gray-600 mt-2">Organize suas finanças com categorias personalizadas</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' }}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle style={{ color: '#1E3A8A' }}>
                  Criar Nova Categoria
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Categoria</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Investimentos, Lazer, etc."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={type} onValueChange={(value: 'INCOME' | 'EXPENSE') => setType(value)} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INCOME">Receita</SelectItem>
                      <SelectItem value="EXPENSE">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    style={{ backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' }}
                  >
                    Criar Categoria
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Categorias</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {categories.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Categorias cadastradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias de Receita</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {incomeCategories.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Para organizar suas receitas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias de Despesa</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {expenseCategories.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Para organizar suas despesas
              </p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-500">Carregando categorias...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Categorias de Receita */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  Categorias de Receita
                </CardTitle>
                <CardDescription>
                  {incomeCategories.length} categoria(s) de receita
                </CardDescription>
              </CardHeader>
              <CardContent>
                {incomeCategories.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    Nenhuma categoria de receita cadastrada.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {incomeCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-green-50"
                      >
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{category.name}</span>
                          {category.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Padrão
                            </Badge>
                          )}
                        </div>
                        {!category.isDefault && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(category)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(category)}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Categorias de Despesa */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <TrendingDown className="h-5 w-5" />
                  Categorias de Despesa
                </CardTitle>
                <CardDescription>
                  {expenseCategories.length} categoria(s) de despesa
                </CardDescription>
              </CardHeader>
              <CardContent>
                {expenseCategories.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    Nenhuma categoria de despesa cadastrada.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {expenseCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-red-50"
                      >
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-red-600" />
                          <span className="font-medium">{category.name}</span>
                          {category.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Padrão
                            </Badge>
                          )}
                        </div>
                        {!category.isDefault && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(category)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(category)}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Informações sobre categorias personalizadas */}
        {customCategories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Suas Categorias Personalizadas</CardTitle>
              <CardDescription>
                Você criou {customCategories.length} categoria(s) personalizada(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                {customCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-blue-50"
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">{category.name}</p>
                        <p className="text-xs text-gray-600">
                          {category.type === 'INCOME' ? 'Receita' : 'Despesa'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Dialog para editar categoria */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: '#1E3A8A' }}>
              Editar Categoria
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Nome da Categoria</Label>
              <Input
                id="editName"
                placeholder="Ex: Investimentos, Lazer, etc."
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1"
                style={{ backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' }}
              >
                Salvar Alterações
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
