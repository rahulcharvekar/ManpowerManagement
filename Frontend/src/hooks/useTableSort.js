import { useState, useMemo } from 'react';

const useTableSort = (initialData = [], initialSortBy = 'createdAt', initialSortDir = 'desc') => {
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDir, setSortDir] = useState(initialSortDir);
  const [sortByColumn, setSortByColumn] = useState('date'); // Assuming date for createdAt

  const sortedData = useMemo(() => {
    return [...initialData].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      // Handle date fields
      if (sortByColumn === 'date' && aVal && bVal) {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [initialData, sortBy, sortDir, sortByColumn]);

  const handleSort = (field) => {
    let newSortDir = sortDir;
    let newSortByColumn = sortByColumn;
    if (sortBy === field) {
      newSortDir = sortDir === 'asc' ? 'desc' : 'asc';
      setSortDir(newSortDir);
    } else {
      setSortBy(field);
      newSortDir = 'asc';
      setSortDir('asc');
      // Determine sortByColumn based on field name
      const isDateField = field.toLowerCase().includes('date') || field.toLowerCase().includes('time') || field.toLowerCase().includes('created') || field.toLowerCase().includes('updated');
      newSortByColumn = isDateField ? 'date' : 'string';
      setSortByColumn(newSortByColumn);
    }
  };

  return {
    sortedData,
    sortBy,
    sortDir,
    sortByColumn,
    handleSort
  };
};

export default useTableSort;
