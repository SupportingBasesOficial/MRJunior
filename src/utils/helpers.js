export const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

export const formatCurrency = (value) => {
  const num = parseFloat(value) || 0;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  } catch {
    return '-';
  }
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleString('pt-BR');
  } catch {
    return '-';
  }
};

export const generateOSNumber = (counter) =>
  `OS-${String(counter).padStart(4, '0')}`;

export const calcOrdemTotal = (servicos = [], pecas = []) => {
  const totalServicos = servicos.reduce(
    (acc, s) => acc + (parseFloat(s.valor) || 0) * (parseInt(s.quantidade) || 1),
    0
  );
  const totalPecas = pecas.reduce(
    (acc, p) => acc + (parseFloat(p.valorUnitario) || 0) * (parseInt(p.quantidade) || 1),
    0
  );
  return totalServicos + totalPecas;
};

export const STATUS_OS = {
  aberta: { label: 'Aberta', color: '#3B82F6' },
  em_andamento: { label: 'Em Andamento', color: '#FFD700' },
  aguardando_peca: { label: 'Aguard. Peça', color: '#F59E0B' },
  pronto: { label: 'Pronto', color: '#22C55E' },
  entregue: { label: 'Entregue', color: '#16A34A' },
  cancelada: { label: 'Cancelada', color: '#FF4444' },
};

export const STATUS_AGENDA = {
  agendado: { label: 'Agendado', color: '#3B82F6' },
  confirmado: { label: 'Confirmado', color: '#22C55E' },
  cancelado: { label: 'Cancelado', color: '#FF4444' },
  realizado: { label: 'Realizado', color: '#16A34A' },
};
