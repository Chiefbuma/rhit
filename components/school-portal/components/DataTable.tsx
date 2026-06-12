import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  sortKey?: keyof T | string;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchFilter: (item: T, query: string) => boolean;
  bulkActions?: (selected: T[]) => React.ReactNode;
  idKey: keyof T | ((item: T) => string);
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  searchFilter,
  bulkActions,
  idKey,
  emptyMessage = 'No matching records found.'
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Helper to extract ID string
  const getId = (item: T): string => {
    if (typeof idKey === 'function') {
      return (idKey as any)(item);
    }
    return String(item[idKey]);
  };

  // Filter
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    return data.filter(item => searchFilter(item, searchQuery.toLowerCase()));
  }, [data, searchQuery, searchFilter]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    
    // Simple sort copy
    const sorted = [...filteredData];
    sorted.sort((a: any, b: any) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Fallback for sub-property Sorting if sortField has periods e.g. "documentStatus.idUploaded"
      if (typeof sortField === 'string' && sortField.includes('.')) {
        aVal = sortField.split('.').reduce((obj, key) => obj?.[key], a);
        bVal = sortField.split('.').reduce((obj, key) => obj?.[key], b);
      }

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      
      return sortDirection === 'asc' 
        ? (aVal > bVal ? 1 : -1) 
        : (bVal > aVal ? 1 : -1);
    });
    return sorted;
  }, [filteredData, sortField, sortDirection]);

  // Pagination bounds
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Handle Sort Toggle
  const handleSort = (field?: string) => {
    if (!field) return;
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pageIds = paginatedData.map(getId);
      setSelectedIds(prev => {
        const next = new Set(prev);
        pageIds.forEach(id => next.add(id));
        return next;
      });
    } else {
      const pageIds = paginatedData.map(getId);
      setSelectedIds(prev => {
        const next = new Set(prev);
        pageIds.forEach(id => next.delete(id));
        return next;
      });
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const allPageSelected = paginatedData.length > 0 && paginatedData.every(item => selectedIds.has(getId(item)));
  const selectedList = data.filter(item => selectedIds.has(getId(item)));

  return (
    <div className="flex flex-col space-y-4">
      {/* Table Action / Search bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        
        {/* Bulk action buttons */}
        {selectedList.length > 0 && bulkActions && (
          <div className="flex items-center space-x-2 bg-accent/30 border border-accent rounded-lg py-1.5 px-3">
            <span className="text-xs text-primary font-medium">
              {selectedList.length} selected
            </span>
            <div className="h-4 w-px bg-accent"></div>
            {bulkActions(selectedList)}
          </div>
        )}
      </div>

      {/* Styled Table Frame */}
      <div className="overflow-x-auto bg-white border border-zinc-200 rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/80">
              {bulkActions && (
                <th className="py-3 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary"
                    checked={allPageSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
              )}
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`py-3 px-4 text-xs font-semibold text-zinc-600 select-none ${col.sortKey ? 'cursor-pointer hover:bg-zinc-100 transition' : ''} ${col.className || ''}`}
                  onClick={() => col.sortKey && handleSort(col.sortKey as string)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{col.header}</span>
                    {col.sortKey && (
                      <span className="text-zinc-400">
                        {sortField === col.sortKey ? (
                          sortDirection === 'asc' ? <ChevronUp className="h-3.5 w-3.5 text-zinc-700" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-700" />
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-60" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => {
                const id = getId(item);
                const isSelected = selectedIds.has(id);
                return (
                  <tr
                    key={id}
                    className={`hover:bg-zinc-50/50 transition duration-150 ${isSelected ? 'bg-accent/20' : ''}`}
                  >
                    {bulkActions && (
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(id, e.target.checked)}
                        />
                      </td>
                    )}
                    {columns.map((col, cIndex) => (
                      <td key={cIndex} className={`py-3 px-4 text-sm text-zinc-700 ${col.className || ''}`}>
                        {col.accessor(item)}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={(columns.length + (bulkActions ? 1 : 0))} className="py-8 px-4 text-center text-zinc-400 text-sm">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <span className="text-2xl">🔍</span>
                    <span>{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center space-x-2 text-xs text-zinc-500">
          <span>Show</span>
          <select
            className="border border-zinc-200 rounded px-2 py-1 bg-white focus:ring-1 focus:ring-primary"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} rows
              </option>
            ))}
          </select>
          <span>
            of <span className="font-medium text-zinc-700">{sortedData.length}</span> records
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            className="p-1 px-2.5 border border-zinc-200 rounded-lg text-xs font-semibold hover:bg-zinc-50 text-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            First
          </button>
          <button
            className="p-1.5 border border-zinc-200 rounded-lg hover:bg-zinc-50 text-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <span className="text-xs font-medium text-zinc-700 px-3 py-1 bg-zinc-100 rounded-lg">
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="p-1.5 border border-zinc-200 rounded-lg hover:bg-zinc-50 text-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            className="p-1 px-2.5 border border-zinc-200 rounded-lg text-xs font-semibold hover:bg-zinc-50 text-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
}
