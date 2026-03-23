import { useState, useEffect, useCallback } from 'react';
import { caseService } from '../services/caseService.js';

export function useCases(filters = {}) {
  const [cases, setCases] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await caseService.getCases({ ...filters, page });
      setCases(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(err.message || 'Failed to load cases.');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters), page]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  return { cases, total, loading, error, page, setPage, refresh: fetchCases };
}

export function useCase(id) {
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCase = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await caseService.getCase(id);
      setCaseData(data);
    } catch (err) {
      setError(err.message || 'Failed to load case.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCase();
  }, [fetchCase]);

  return { caseData, loading, error, refresh: fetchCase };
}
