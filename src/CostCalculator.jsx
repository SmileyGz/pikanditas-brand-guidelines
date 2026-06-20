import React, { useState, useEffect } from 'react';
import './index.css';

function CostCalculator() {
  const [ingredients, setIngredients] = useState(() => {
    const saved = localStorage.getItem('pikanditas_ingredients');
    return saved ? JSON.parse(saved) : [
      { id: 'tamarindo', name: 'Pulpa Tamarindo', weight: 250, cost: 33.75 },
      { id: 'miguelito', name: 'Miguelito', weight: 150, cost: 48.00 },
      { id: 'tajin', name: 'Tajín', weight: 150, cost: 45.75 },
      { id: 'botanera', name: 'Salsa Botanera', weight: 250, cost: 10.42 },
      { id: 'azucar', name: 'Azúcar', weight: 200, cost: 5.00 },
      { id: 'chamoy', name: 'Chamoy Anita', weight: 250, cost: 5.00 },
      { id: 'extras', name: 'Limón y extras', weight: 35, cost: 4.00 }
    ];
  });

  const [assembly, setAssembly] = useState(() => {
    const saved = localStorage.getItem('pikanditas_assembly');
    return saved ? JSON.parse(saved) : {
      gummyWeight: 42,
      gummyCostPerKilo: 120,
      sauceWeight: 11,
      packageCost: 1.00
    };
  });

  const [pricing, setPricing] = useState(() => {
    const saved = localStorage.getItem('pikanditas_pricing');
    return saved ? JSON.parse(saved) : {
      public: 20,
      wholesale: 12,
      distributor: 10
    };
  });

  useEffect(() => {
    localStorage.setItem('pikanditas_ingredients', JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem('pikanditas_assembly', JSON.stringify(assembly));
  }, [assembly]);

  useEffect(() => {
    localStorage.setItem('pikanditas_pricing', JSON.stringify(pricing));
  }, [pricing]);

  const handleIngredientChange = (id, field, value) => {
    setIngredients(prev => prev.map(ing => 
      ing.id === id ? { ...ing, [field]: value } : ing
    ));
  };

  const handleAssemblyChange = (field, value) => {
    setAssembly(prev => ({ ...prev, [field]: value }));
  };

  const handlePricingChange = (field, value) => {
    setPricing(prev => ({ ...prev, [field]: value }));
  };

  // Calculations
  const totalSauceWeight = ingredients.reduce((sum, item) => sum + Number(item.weight || 0), 0);
  const totalSauceCost = ingredients.reduce((sum, item) => sum + Number(item.cost || 0), 0);
  const sauceCostPerGram = totalSauceWeight > 0 ? totalSauceCost / totalSauceWeight : 0;

  const gummyCostPerBag = (Number(assembly.gummyWeight || 0) / 1000) * Number(assembly.gummyCostPerKilo || 0);
  const sauceCostPerBag = Number(assembly.sauceWeight || 0) * sauceCostPerGram;
  const totalCostPerBag = gummyCostPerBag + sauceCostPerBag + Number(assembly.packageCost || 0);

  const calculateProfit = (price) => Number(price) - totalCostPerBag;
  const calculateMargin = (price) => Number(price) > 0 ? (calculateProfit(price) / Number(price)) * 100 : 0;

  return (
    <div className="calculator-container">
      <div className="card tagline-card tilt-left" style={{ width: '100%', margin: '0 auto 2rem' }}>
        <h2>Calculadora Dinámica de Costos</h2>
        <p>Ajusta las cantidades y precios para ver tu rentabilidad en tiempo real.</p>
        <div style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
          Costo Actual por Bolsa: <strong>${totalCostPerBag.toFixed(2)} MXN</strong>
        </div>
      </div>

      <div className="calculator-grid">
        {/* Section 1: Sauce Ingredients */}
        <div className="card tilt-right">
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>1. Preparación de Salsa</h3>
          <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Define el costo y peso de lo que echas al bowl para hacer la mezcla maestra.</p>
          
          <div className="ingredient-list">
            <div className="ingredient-header">
              <span>Ingrediente</span>
              <span>Gramos</span>
              <span>Costo ($)</span>
            </div>
            {ingredients.map(ing => (
              <div key={ing.id} className="ingredient-row">
                <span>{ing.name}</span>
                <input 
                  type="number" 
                  value={ing.weight} 
                  onChange={(e) => handleIngredientChange(ing.id, 'weight', e.target.value)}
                />
                <input 
                  type="number" 
                  value={ing.cost} 
                  onChange={(e) => handleIngredientChange(ing.id, 'cost', e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="summary-box">
            <p>Total Peso: <strong>{totalSauceWeight}g</strong></p>
            <p>Costo Total: <strong>${totalSauceCost.toFixed(2)}</strong></p>
            <p>Costo por Gramo: <strong>${sauceCostPerGram.toFixed(4)}</strong></p>
          </div>
        </div>

        {/* Section 2: Assembly */}
        <div className="card tilt-left">
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>2. Armado por Bolsa</h3>
          
          <div className="form-group">
            <label>Costo del kilo de Gomitas ($):</label>
            <input type="number" value={assembly.gummyCostPerKilo} onChange={(e) => handleAssemblyChange('gummyCostPerKilo', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Gramos de Gomitas por bolsa:</label>
            <input type="number" value={assembly.gummyWeight} onChange={(e) => handleAssemblyChange('gummyWeight', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Gramos de Salsa por bolsa:</label>
            <input type="number" value={assembly.sauceWeight} onChange={(e) => handleAssemblyChange('sauceWeight', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Costo de Empaque (Bolsa + Etiqueta):</label>
            <input type="number" value={assembly.packageCost} onChange={(e) => handleAssemblyChange('packageCost', e.target.value)} step="0.1" />
          </div>

          <div className="summary-box">
            <p>Costo Gomitas: <strong>${gummyCostPerBag.toFixed(2)}</strong></p>
            <p>Costo Salsa: <strong>${sauceCostPerBag.toFixed(2)}</strong></p>
            <p>Costo Empaque: <strong>${Number(assembly.packageCost).toFixed(2)}</strong></p>
            <h4 style={{ marginTop: '0.5rem' }}>TOTAL: ${totalCostPerBag.toFixed(2)}</h4>
          </div>
        </div>

        {/* Section 3: Prices and Margins */}
        <div className="card tilt-right" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>3. Estructura de Precios</h3>
          <table className="cost-table">
            <thead>
              <tr>
                <th>Nivel de Venta</th>
                <th>Precio Editable ($)</th>
                <th>Utilidad (Ganancia)</th>
                <th>Margen (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Público</strong></td>
                <td><input type="number" value={pricing.public} onChange={(e) => handlePricingChange('public', e.target.value)} /></td>
                <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>${calculateProfit(pricing.public).toFixed(2)}</td>
                <td>{calculateMargin(pricing.public).toFixed(1)}%</td>
              </tr>
              <tr>
                <td><strong>Mayoreo</strong></td>
                <td><input type="number" value={pricing.wholesale} onChange={(e) => handlePricingChange('wholesale', e.target.value)} /></td>
                <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>${calculateProfit(pricing.wholesale).toFixed(2)}</td>
                <td>{calculateMargin(pricing.wholesale).toFixed(1)}%</td>
              </tr>
              <tr>
                <td><strong>Distribuidor</strong></td>
                <td><input type="number" value={pricing.distributor} onChange={(e) => handlePricingChange('distributor', e.target.value)} /></td>
                <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>${calculateProfit(pricing.distributor).toFixed(2)}</td>
                <td>{calculateMargin(pricing.distributor).toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 4: Proyecciones */}
        <div className="card tilt-left-more" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>4. Proyecciones (Costo de Armado Múltiple)</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Costos de producción dinámicos para distintas cantidades de bolsas.</p>
          <table className="cost-table">
            <thead>
              <tr>
                <th>Cantidad</th>
                <th>Costo Total de Producción</th>
              </tr>
            </thead>
            <tbody>
              {[1, 10, 12, 23].map(qty => (
                <tr key={qty}>
                  <td><strong>{qty} {qty === 1 ? 'Bolsa' : 'Bolsas'}</strong></td>
                  <td>${(totalCostPerBag * qty).toFixed(2)} MXN</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CostCalculator;
