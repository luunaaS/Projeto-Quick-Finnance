// Simple test component to check if basic functionality works
export function SimpleTest() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-blue-800">QFin - Sistema Financeiro</h1>
      <p className="text-gray-600">Sistema funcionando sem dependências externas</p>
      
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="p-4 bg-white border rounded-lg shadow">
          <h2 className="text-lg font-semibold text-green-600">Receitas</h2>
          <p className="text-2xl font-bold">R$ 5.500,00</p>
        </div>
        
        <div className="p-4 bg-white border rounded-lg shadow">
          <h2 className="text-lg font-semibold text-red-600">Despesas</h2>
          <p className="text-2xl font-bold">R$ 2.300,00</p>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-white border rounded-lg shadow">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Gráfico Simples</h3>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-sm">
              <span>Receitas</span>
              <span>70%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm">
              <span>Despesas</span>
              <span>30%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-600 h-2 rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}