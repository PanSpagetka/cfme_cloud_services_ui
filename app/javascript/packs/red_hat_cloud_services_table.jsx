import React, { useState, useEffect, useReducer }  from 'react';
import { TablePfProvider, Table, Filter, FormControl, Button, Checkbox, Paginator, PAGINATION_VIEW } from 'patternfly-react'
import { reducer, updateRows, selectRow, sortColumn } from './reducers'
import { createColumns, setPageWrapper, perPageSelect } from './helper'

export const SortingContext = React.createContext();
export const SelectedRows = React.createContext();

const RedHatCloudServicesTable = (props) => {
  const [state, dispatch] = useReducer(reducer, {
    sortableColumnProperty: 'name',
    rows: [...props.rows],
    pagedRows: [...props.rows],
    sortOrderAsc: true,
    columns: [],
    pagination: {
      page: 1,
      perPage: 10,
      perPageOptions: [10, 25, 50, 100]
    },
    total: 0,
  });

  useEffect(() => {
    dispatch({ type: 'setColumns', columns: createColumns(false, true, props.columns, dispatch) });
  }, [])

  useEffect(() => {
    dispatch({type: 'setTotal', total: props.rows.length});
    dispatch({ type: 'updateRows', rows: props.rows });
  }, [props.rows])

  useEffect(() => {
    setPage()(state.pagination.page);
  }, [state.rows])

  const setPage = setPageWrapper(state, dispatch);
  const { PfProvider, Body, Header } = Table;
  console.log('STATE RENDER:', state);
  return (
    <SelectedRows.Provider value={state.rows}>
    <SortingContext.Provider value={{sortOrderAsc: state.sortOrderAsc, sortableColumnProperty: state.sortableColumnProperty}}>
      <PfProvider
         striped
         bordered
         columns={state.columns}
         dataTable
         hover
         className="generic-preview-table"
       >
         <Header />
         <Body
           rows={state.pagedRows}
           rowKey={'id'}
         // onRow={row => ({ onClick: (...args) => console.log('click: ', ...args) })}
         />
      </PfProvider>
      <Paginator
        viewType={PAGINATION_VIEW.TABLE}
        pagination={state.pagination}
        itemCount={state.total}
        onPageSet={setPage()}
        onPerPageSelect={perPageSelect(state.pagination, setPage)}
      />
    </SortingContext.Provider>
    </SelectedRows.Provider>
  );
};

export default RedHatCloudServicesTable;
