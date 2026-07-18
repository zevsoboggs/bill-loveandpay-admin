import { useSelect } from '@refinedev/antd';
import { Select } from 'antd';

// Build a change-handler that merges a single filter into Refine's useTable
// (empty value removes it). operator maps to the backend query dialect:
// 'eq' → field=value, 'contains' → field_like=value.
export const makeSetFilter = (setFilters) => (field, operator = 'eq') => (value) =>
  setFilters([{ field, operator, value: value === '' || value == null ? undefined : value }], 'merge');

// Searchable client picker used as a filter across lists.
export function ClientFilterSelect({ onChange, style }) {
  const { selectProps } = useSelect({ resource: 'clients', optionLabel: 'name', optionValue: 'id', pagination: { pageSize: 100 } });
  return (
    <Select {...selectProps} allowClear showSearch placeholder="Клиент" style={{ minWidth: 200, ...style }}
      onChange={(v, opt) => { selectProps.onChange?.(v, opt); onChange(v); }}
      onClear={() => onChange(undefined)} />
  );
}
