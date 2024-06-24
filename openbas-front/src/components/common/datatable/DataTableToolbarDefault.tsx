import { DataTablePagination, DataTableRowPerPage } from 'filigran-ui';
import { ToggleButtonGroup } from '@mui/material';
import React, { FunctionComponent, ReactNode } from 'react';

interface Props {
  searchBar?: ReactNode;
  toggleGroup?: ReactNode;
}

const DataTableToolbarDefault: FunctionComponent<Props> = ({
  searchBar, toggleGroup,
}) => {
  return (
    <div className="flex items-center justify-between gap-2">
      {searchBar}
      <div className="flex items-center gap-2">
        <DataTableRowPerPage />
        <DataTablePagination />
        <ToggleButtonGroup exclusive>
          {toggleGroup}
        </ToggleButtonGroup>
      </div>
    </div>
  );
};

export default DataTableToolbarDefault;
