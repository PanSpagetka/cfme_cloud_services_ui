import React, { useState, useEffect, useReducer, useContext }  from 'react';
import { TablePfProvider, Table, Filter, FormControl, Button, Checkbox, Paginator, PAGINATION_VIEW } from 'patternfly-react'
import RedHatCloudServicesTable, { SelectedRows } from './red_hat_cloud_services_table'

const filterFields = [
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

const columns = [
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

const RedHatCloudServices = (_props) => {
    const [currentFilterType, setCurrentFilterType] = useState(filterFields[0]);
    const [currentValue, setCurrentValue] =  useState('');
    const [filteredRows, setFilteredRows] = useState([]);
    const [rows, setRows] = useState([]);

    const selectedRows = useContext(SelectedRows);
    useEffect(() => {
      API.get('/api/providers?expand=resources').then(data => {
        const rows = data.resources.map( (item) => ({
          id: item.id,
          name: item.name,
          type: item.type,
          action: <Button>Synchronize</Button>,
          selected: false,
        }))
        setRows(rows);
        setFilteredRows(rows);
      });
    }, [])

    useEffect(() => {
      const a = rows.map( row => ({...row, ...selectedRows.find(r => r.id === row.id)}))
      console.log(a);
    }, [selectedRows]);
    console.log(selectedRows);

    return (
      <div>
        <h1>
        Red hat Cloud Services
        </h1>
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
            <div class="form-group">
              <button class="btn btn-default" type="button" id="upload-selected">Upload</button>
              <button class="btn btn-default" type="button" id="Synchronize" disabled>Synchronize</button>
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

export default RedHatCloudServices;
