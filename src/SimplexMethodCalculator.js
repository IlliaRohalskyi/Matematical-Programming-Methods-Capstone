import React, { useState } from 'react';

export function SimplexMethodCalculator() {
  const [c, setC] = useState('4, 3, 3, 7');
  const [a, setA] = useState('2, 1, 1, 1\n1, 0, 1, 1\n1, 5, 1, 0');
  const [b, setB] = useState('280, 80, 250');
  const [result, setResult] = useState(null);

  const parseArray = (str) => {
    return str.split(/[,\n]/).map(val => parseFloat(val.trim()));
  };

  const metLP = (A, b, c) => {
    const m = A.length;
    const n = A[0].length;
    
    const extendedA = A.map((row, i) => [...row, ...Array(m).fill(0).map((_, j) => j === i ? 1 : 0)]);
    const extendedC = [...c, ...Array(m).fill(0)];
    
    let B = Array.from({length: m}, (_, i) => n + i);
    let F = Array.from({length: n}, (_, i) => i);
    let iter = 0;
    let iterations = [];

    while (true) {
      if (iter > 20) break;

      const cB = B.map(idx => extendedC[idx]);
      const cF = F.map(idx => extendedC[idx]);
      const fB = cB.reduce((sum, val, idx) => sum + val * b[idx], 0);

      const d = extendedC.map((val, j) => {
        const subSum = extendedA.reduce((sum, row, i) => sum + cB[i] * row[j], 0);
        return val - subSum;
      });

      iterations.push({
        iteration: iter,
        freeVariables: F,
        basisVariables: B,
        objectiveFunctionValue: fB,
        reducedCosts: d
      });

      if (Math.max(...d) <= 0) {
        const xopt = new Array(n).fill(0);
        B.filter(idx => idx < n).forEach((idx, i) => xopt[idx] = b[B.indexOf(idx)]);
        const fmax = xopt.reduce((sum, val, j) => sum + c[j] * val, 0);

        return {
          optimalPlan: xopt,
          optimalValue: fmax,
          iterations
        };
      }

      const k = d.indexOf(Math.max(...d));
      
      const r = extendedA.map((row, i) => row[k] > 0 ? b[i] / row[k] : Infinity);
      const l = r.indexOf(Math.min(...r.filter(x => x !== Infinity)));

      if (l === -1) {
        throw new Error("Задача необмежена");
      }

      const theta = b[l] / extendedA[l][k];
      b[l] = theta;
      extendedA[l] = extendedA[l].map(val => val / extendedA[l][k]);

      for (let i = 0; i < m; i++) {
        if (i !== l) {
          const factor = extendedA[i][k];
          b[i] -= factor * b[l];
          extendedA[i] = extendedA[i].map((val, j) => val - factor * extendedA[l][j]);
        }
      }

      const temp = F[k];
      F[k] = B[l];
      B[l] = temp;

      iter++;
    }

    throw new Error("Перевищено максимальну кількість ітерацій");
  };

  const handleCalculate = () => {
    try {
      const parsedC = parseArray(c);
      const parsedA = a.split('\n').map(row => parseArray(row));
      const parsedB = parseArray(b);

      const result = metLP(parsedA, parsedB, parsedC);
      setResult(result);
    } catch (error) {
      alert('Помилка при обчисленні: ' + error.message);
    }
  };

  return (
    <div style={{maxWidth: '800px', margin: 'auto', padding: '20px'}}>
      <h1>Симплекс-метод</h1>
      <div>
        <label>Коефіцієнти цільової функції (c): </label>
        <input 
          type="text" 
          value={c} 
          onChange={(e) => setC(e.target.value)} 
          style={{width: '100%', marginBottom: '10px'}}
        />
      </div>
      <div>
        <label>Матриця коефіцієнтів обмежень (A): </label>
        <textarea 
          value={a} 
          onChange={(e) => setA(e.target.value)} 
          style={{width: '100%', height: '100px', marginBottom: '10px'}}
        />
      </div>
      <div>
        <label>Вектор правих частин обмежень (b): </label>
        <input 
          type="text" 
          value={b} 
          onChange={(e) => setB(e.target.value)} 
          style={{width: '100%', marginBottom: '10px'}}
        />
      </div>
      <button onClick={handleCalculate}>Обчислити</button>

      {result && (
        <div>
          <h2>Результати:</h2>
          <p>Оптимальний план: {result.optimalPlan.map(x => x.toFixed(2)).join(', ')}</p>
          <p>Оптимальне значення: {result.optimalValue.toFixed(2)}</p>
          
          <h3>Ітерації:</h3>
          {result.iterations.map((iteration, index) => (
            <div key={index}>
              <p>Ітерація {iteration.iteration}</p>
              <p>Вільні змінні: {iteration.freeVariables.join(', ')}</p>
              <p>Базисні змінні: {iteration.basisVariables.join(', ')}</p>
              <p>Значення цільової функції: {iteration.objectiveFunctionValue.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}