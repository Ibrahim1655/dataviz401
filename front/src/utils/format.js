// calcule la moyenne d'un tableau en ignorant les valeurs null/undefined
export function avg(arr) {
  const vals = arr.filter(v => v !== null && v !== undefined)
  return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null
}

// formate un nombre en français avec le bon nombre de décimales
// retourne '—' si la valeur est null (pas de données)
export function fmt(n, decimals = 1) {
  if (n === null || n === undefined) return '—'
  return n.toLocaleString('fr-FR', { maximumFractionDigits: decimals })
}
