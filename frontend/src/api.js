const API_BASE_URL = '/api';

/**
 * Helper to handle HTTP errors with descriptive messages
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((err) => `${err.loc?.slice(-1)[0] || 'field'}: ${err.msg}`).join(', ');
        } else {
          errorMessage = errorData.detail;
        }
      }
    } catch {
      // Use status text if JSON parse fails
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function fetchSummary() {
  const response = await fetch(`${API_BASE_URL}/summary`);
  return handleResponse(response);
}

export async function fetchTransactions({ search = '', type = '', category = '' } = {}) {
  const params = new URLSearchParams();
  if (search.trim()) params.append('search', search.trim());
  if (type && type !== 'all') params.append('type', type);
  if (category && category !== 'all') params.append('category', category);

  const url = `${API_BASE_URL}/transactions${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);
  return handleResponse(response);
}

export async function fetchTransaction(id) {
  const response = await fetch(`${API_BASE_URL}/transactions/${id}`);
  return handleResponse(response);
}

export async function createTransaction(transactionData) {
  const response = await fetch(`${API_BASE_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transactionData),
  });
  return handleResponse(response);
}

export async function updateTransaction(id, transactionData) {
  const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transactionData),
  });
  return handleResponse(response);
}

export async function deleteTransaction(id) {
  const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

export async function fetchCategories() {
  const response = await fetch(`${API_BASE_URL}/categories`);
  return handleResponse(response);
}
