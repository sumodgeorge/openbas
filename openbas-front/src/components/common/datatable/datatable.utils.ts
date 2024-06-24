import { ColumnDef, TableOptions } from '@tanstack/react-table';
import { DatatableI18nKey } from 'filigran-ui';
import { useFormatter } from '../../i18n';

export const defaultColumDef = <TData >(columns: ColumnDef<TData >[]): ColumnDef<TData>[] => {
  return columns.map((col) => ({
    ...col,
    enableHiding: false,
  }));
};

export const defaultTableOptions = <TData >(tableOptions: Partial<TableOptions<TData>>): Partial<TableOptions<TData>> => {
  return {
    ...tableOptions,
    manualSorting: true,
    manualPagination: true,
  };
};

export const datatableI18nKey = (): Partial<DatatableI18nKey> => {
  const { t } = useFormatter();
  return {
    'Rows per page': t('Rows per page'),
    Rows: t('Rows'),
    'Manage columns visibility': t('Manage columns visibility'),
    Asc: t('Asc'),
    Desc: t('Desc'),
    Hide: t('Hide'),
    'Go to first page': t('Go to first page'),
    'Go to previous page': t('Go to previous page'),
    'Go to next page': t('Go to next page'),
    'Go to last page': t('Go to last page'),
    to: t('to'),
  };
};
