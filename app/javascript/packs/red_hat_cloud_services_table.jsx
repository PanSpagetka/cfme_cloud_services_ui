import React, { useState, useEffect, useReducer }  from 'react';
import orderBy from 'lodash/orderBy'
import { TablePfProvider, Table, Filter, FormControl, Button, Checkbox, Paginator, PAGINATION_VIEW } from 'patternfly-react'

const mockFilterExampleFields = [
  {
    id: 'name',
    title: 'Name',
    placeholder: 'Filter by Name',
    filterType: 'text'
  },
  {
    id: 'type',
    title: 'Type',
    placeholder: 'Filter by Provider Type',
    filterType: 'text'
  }
];
const headerFormat = value => <Table.Heading>{value}</Table.Heading>;
const sortableHeaderFormat = (onSort, { column: { header: { label } }, property }, sortOrderAsc, isSorted) => (
    <Table.Heading
      onClick={() => onSort(property)}
      sort={isSorted}
      sortDirection={sortOrderAsc ? 'asc' : 'desc'}
      className="clickable"
    >
      {label}
    </Table.Heading>);
const cellFormat = (value, { rowData: { selected } }) => (
    <Table.Cell className={`clickable ${selected ? 'selected' : ''}`}>
      {value}
    </Table.Cell>
  );


const mockPatternflyColumns = [
  {
    label: 'Name',
    property: 'name'
  },
  {
    label: 'Type',
    property: 'type'
  },
  {
    label: 'Action',
    property: 'action'
  },
];

const mockBootstrapRows = [
  {
    id: 0,
    name: 'Provider1',
    type: 'Amazon',
    action: <Button>connect</Button>,
  },
  {
    id: 1,
    name: 'Provider2',
    type: 'Amazon',
    action: <Button>connect</Button>,
  },
  {
    id: 2,
    name: 'Provider3',
    type: 'Openstack',
    action: <Button>connect</Button>,
  },
  {
    id: 3,
    name: 'Provider4',
    type: 'Azure',
    action: <Button>connect</Button>,
  }
];


const RedHatCloudServices = (props) => RedHatCloudServicesX({rows: mockBootstrapRows, filterFields: mockFilterExampleFields, columns: mockPatternflyColumns});

const RedHatCloudServicesX = ({_rows, filterFields, columns}) => {
    const [currentFilterType, setCurrentFilterType] = useState(filterFields[0]);
    const [currentValue, setCurrentValue] =  useState('');
    const [filteredRows, setFilteredRows] = useState([]);
    const [rows, setRows] = useState([]);

    useEffect(() => {
      API.get('/api/providers?expand=resources').then(data => {
        const rows = data.resources.map( (item) => ({
          id: item.id,
          name: item.name,
          type: item.type,
          action: <Button>Synchronize</Button>,
        }))
        setRows(rows);
        setFilteredRows(rows);
      });
    }, [])
    console.log('SERVICES ROWS', filteredRows);
    return (
      <div>
        <div className="row toolbar-pf table-view-pf-toolbar">
          <form className="toolbar-pf-actions">
            <div className="form-group toolbar-pf-filter">
              <Filter>
                <Filter.TypeSelector
                  filterTypes={filterFields}
                  currentFilterType={currentFilterType}
                  onFilterTypeSelected={(filterType) => {
                    if (currentFilterType !== filterType) {
                      setCurrentFilterType(filterType);
                      setCurrentValue('');
                      setFilteredRows(rows);
                    }
                  }}
                />
                <FormControl
                  type={currentFilterType.filterType}
                  value={currentValue}
                  placeholder={currentFilterType.placeholder}
                  onChange={({ target: { value: filterValue } }) => {
                    setCurrentValue(filterValue);
                    setFilteredRows(rows.filter(row => row[currentFilterType.id].toLowerCase().includes(filterValue.toLowerCase())));
                  }}
                  onKeyPress={e => console.log(e)}
                />
              </Filter>
            </div>
          </form>
        </div>
        <RedHatCloudServicesTable
          columns={columns}
          rows={filteredRows}
        />
      </div>
    );
};

const sortColumn = ({sortableColumnProperty, rows, sortOrderAsc}, {property}) => {
  const asc = sortableColumnProperty === property ? !sortOrderAsc : true;
  return {
    rows: orderBy(rows, property, asc ? 'asc' : 'desc'),
    sortableColumnProperty: property,
    sortOrderAsc: asc,
  }
}

const selectRow = ({rows, ...rest}, {selectedRow}) => ({
  ...rest,
  rows: rows.map(item => selectedRow.id === item.id ? {...selectedRow, selected: !selectedRow.selected} : item)
});

const updateRows = ({sortableColumnProperty, sortOrderAsc}, {rows}) => {
  // console.log('update rows', rows);
  return sortColumn({sortableColumnProperty, rows, sortOrderAsc: !sortOrderAsc}, {property: sortableColumnProperty})
};



const reducer = (state, action) => {
  switch (action.type) {
    case 'setColumns':
      return {...state, columns: action.columns}
    case 'sortColumn':
      return {...state, ...sortColumn(state, action)};
    case 'selectRow':
      return {...state, ...selectRow(state, action)};
    case 'updateRows':
      return {...state, ...updateRows(state, action)};
    case 'setPagination':
      return {...state, pagination: action.pagination};
    case 'setTotal':
      return {...state, total: action.total}
    default:

  }
}

const RedHatCloudServicesTable = (props) => {
  console.log('PROPS', props);
  const [state, dispatch] = useReducer(reducer, {
    sortableColumnProperty: 'name',
    rows: [...props.rows],
    sortOrderAsc: true,
    columns: [],
    pagination: {
      page: 1,
      perPage: 10,
      perPageOptions: [10, 25, 50, 100]
    },
    total: 0,
  });

  const createColumns = (showIcon, showSelect, columns) => {
      let result = [];
      if (showIcon) {
        result = [{
          propery: 'icon',
          header: {
            label: '',
            formatters: [headerFormat],
          },
        },
        ...result];
      }
      if (showSelect) {
        result = [
          {
            propery: 'select',
            header: {
              label: '',
              formatters: [headerFormat],
            },
            cell: {
              formatters: [
                (value, { rowData }) => (
                  <Table.Cell
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                    className={`clickable ${rowData.selected ? 'selected' : ''}`}
                  >
                    <Checkbox
                      className="cell-middle"
                      checked={!!rowData.selected}
                      onClick={event => event.stopPropagation()}
                      onChange={() =>  dispatch({type: 'selectRow', selectedRow: rowData}) }
                    />
                  </Table.Cell>
                ),
              ],
            },
          },
          ...result,
        ];
      }
      result = [
        ...result,
        ...columns.map(({ property, label }) => ({
          property,
          header: {
            label,
            formatters: [(value, columnProps) => sortableHeaderFormater(value, columnProps)],
          },
          cell: {
            formatters: [cellFormat],
          },
        })),
      ];
      return result;
  };

  const sortableHeaderFormater = (value, columnProps) => sortableHeaderFormat(
    property => dispatch({type: 'sortColumn', property}),
    columnProps,
    state.sortOrderAsc,
    false,
    //console.log(state.sortableColumnProperty, value, columnProps.column.property, state),
  );

   const setPage = (pagination = {...state.pagination}) => (page) => {
    const newPagination = {
      ...pagination,
      page
    };
    const limit = newPagination.perPage;
    const offset = newPagination.perPage * (newPagination.page - 1);
    const pagedRows = props.rows.slice(offset, offset + limit);
    console.log('paged rows:', props, pagedRows, offset, limit);
    dispatch({ type: 'setPagination', pagination: newPagination });
    dispatch({ type: 'updateRows', rows: pagedRows });
  };

  const perPageSelect = (perPage,_e) => {
   const newPagination = {
     ...state.pagination,
     perPage,
     page: 1,
   };
   setPage(newPagination)(1);
   // const limit = newPagination.perPage;
   // const offset = newPagination.perPage * (newPagination.page - 1);
   // const pagedRows = props.rows.slice(offset, offset + limit);
   // // console.log('paged rows:', pagedRows, state.pagination);
   // dispatch({ type: 'updateRows', rows: pagedRows });
   // dispatch({ type: 'setPagination', pagination: newPagination });
 };

  useEffect(() => {
    dispatch({ type: 'setColumns', columns: createColumns(false, true, props.columns) });
  }, [])

  useEffect(() => {
    // dispatch({ type: 'updateRows', rows: props.rows });
    setPage()(state.pagination.page);
    dispatch({type: 'setTotal', total: props.rows.length});
  }, [props.rows])

  const { PfProvider, Body, Header } = Table;
  return (
    <React.Fragment>
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
           rows={state.rows}
           rowKey={'id'}
           onRow={row => ({ onClick: () => console.log() })}
         />
      </PfProvider>
      <Paginator
        viewType={PAGINATION_VIEW.TABLE}
        pagination={state.pagination}
        itemCount={state.total}
        onPageSet={setPage()}
        onPerPageSelect={perPageSelect}
      />
    </React.Fragment>
  );
};

export default RedHatCloudServices;
