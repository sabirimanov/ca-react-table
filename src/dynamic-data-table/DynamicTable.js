import React, {useEffect, useState} from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Select from 'react-dropdown-select';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import {
  find, groupBy, indexOf, sortBy,
} from 'lodash';
import DemoData from './DemoData';
import TableRow from './TableRow';
import TableHeader from './TableHeader';

export default function DynamicTable() {

  const [initialData, setInitialData] = useState({
    data: [],
    columns: []
  });

  const [sorting, setSorting] = useState({
    column: 'id',
    direction: 'asc'
  });

  const [keyword, setKeyword] = useState('');
  const [groupingColumn, setGroupingColumn] = useState(null);

  useEffect(() => {

    // initial data processing
    let initialDemoData;
    if (!('tableData' in localStorage)) {
      initialDemoData = DemoData;

      initialDemoData.columns = initialDemoData.columns.map((col) => ({
        ...col,
        visible: true,
      })).sort((a, b) => a.ordinalNo - b.ordinalNo); // sort columns by ordinalNo

      localStorage.setItem('tableData', JSON.stringify(initialDemoData));
    } else {
      initialDemoData = JSON.parse(localStorage.getItem('tableData'));
    }
    setInitialData(initialDemoData);

    if ('tableSorting' in localStorage) {
      setSorting(JSON.parse(localStorage.getItem('tableSorting')));
    }

    if ('tableSearchKeyword' in localStorage) {
      setKeyword(localStorage.getItem('tableSearchKeyword'));
    }

    if ('tableGroupBy' in localStorage) {
      setGroupingColumn(localStorage.getItem('tableGroupBy'));
    }

  }, [])

  const handleSorting = (colId) => {
    const currentSorting = {...sorting};
    if (currentSorting.column === colId) {
      // same column, change direction
      currentSorting.direction = currentSorting.direction === 'asc' ? 'desc' : 'asc';
    } else {
      currentSorting.column = colId;
      currentSorting.direction = 'asc';
    }
    setSorting(currentSorting);
    localStorage.setItem('tableSorting', JSON.stringify(currentSorting));
  }

  const setSearchKeyword = (keyword) => {
    setKeyword(keyword);
    localStorage.setItem('tableSearchKeyword', keyword);
  }

  const updateInitialDemoData = (demoData) => {
    localStorage.setItem('tableData', JSON.stringify(demoData));
  }

  const handleGrouping = (column) => {
    localStorage.setItem('tableGroupBy', column !== 'none' ? column : null);
    setGroupingColumn(column !== 'none' ? column : null);
  }

  const updateCellData = (rowId, column, newValue) => {
    const { id, type } = column;
    const tmpData = { ...initialData };
    const rowToUpdate = find(tmpData.data, (row) => row.id === rowId);
    if (rowToUpdate) {
      let valueToSet;
      if (type === 'boolean') {
        valueToSet = JSON.parse(newValue);
      } else if (type === 'string' || type === 'number') {
        valueToSet = newValue;
      } else if (type === 'select') {
        valueToSet = rowToUpdate[id];
        if (typeof valueToSet !== 'undefined') {
          valueToSet.some((item, index) => item === newValue
                          && valueToSet.unshift(
                          valueToSet.splice(index, 1)[0],
                        ));
        } else {
          valueToSet = [newValue];
        }
      }
      rowToUpdate[id] = valueToSet;
      const rowIndex = indexOf(tmpData.data, rowToUpdate);
      tmpData.data.splice(rowIndex, 1, rowToUpdate);
    }

    setInitialData(tmpData);
    updateInitialDemoData(tmpData);
  }

  const handleVisibleColumns = (values) => {
    const tmpColsData = [...initialData.columns];
    tmpColsData.forEach((col) => {
      col.visible = !!find(values, (selectedCol) => col.id === selectedCol.id);
    });

    const tmpData = { ...initialData };
    tmpData.columns = tmpColsData;
    setInitialData(tmpData);
    updateInitialDemoData(tmpData);
  }

  const tableRowsData = () => {
    let filteredRows = [...initialData.data];
    if (keyword.length > 0) {
      filteredRows = filteredRows.filter((data) => JSON.stringify(data).toLowerCase().indexOf(keyword.toLowerCase()) !== -1);
    }

    const sortedFilteredRows = sortBy(filteredRows, sorting.column);
    if (sorting.direction === 'desc') {
      sortedFilteredRows.reverse();
    }
    if (groupingColumn && groupingColumn !== "null") {
      // group and make collapsible rows
      const grouped = groupBy(sortedFilteredRows, groupingColumn);

      return Object.keys(grouped).map((group, index) => {
        const groupingColumnData = find(initialData.columns, (col) => col.id === groupingColumn);

        let formattedGroupName = group;
        if (groupingColumnData.type === 'boolean' && group !== 'undefined') {
          formattedGroupName = group === 'false' ? 'No' : 'Yes';
        }
        if (groupingColumnData.type === 'select') {
          formattedGroupName = group.split(',')[0]; // dirty workaround for selects
        }

        return (
          <React.Fragment key={index}>
            <tr className="collapsible-row-header" data-bs-toggle="collapse" data-bs-target={`.crh-rows-${index}`}>
              <td
                  colSpan={initialData.columns.filter((colData) => colData.visible === true).length}
                  align="center"
                  className="text-center fw-bold bg-info-subtle">
                {formattedGroupName !== 'undefined' ? formattedGroupName : 'N/A'}
                {' '}
                ({grouped[group].length})
              </td>
            </tr>
            {grouped[group].map((data) => (
              <TableRow
                  key={data.id}
                  data={data}
                  visibleCols={initialData.columns.filter((colData) => colData.visible === true)}
                  sortingColumn={sorting.column}
                  updateCellData={updateCellData.bind(this)}
                  className={`collapse show crh-rows-${index}`}
              />
            ))}
          </React.Fragment>
        );
      });
    }
    return sortedFilteredRows.map((data) => (
      <TableRow
          key={data.id}
          data={data}
          visibleCols={initialData.columns.filter((colData) => colData.visible === true)}
          sortingColumn={sorting.column}
          updateCellData={updateCellData.bind(this)}
      />
    ));
  }

  return (
    <Container fluid className="p-4">
      <Row className="border-secondary p-3 rounded border-1 border">
        <Col xs={2}>
          <Form.Control
              type="search"
              value={keyword}
              placeholder="Filter table by keyword"
              onChange={(event) => { setSearchKeyword(event.target.value); }}
          />
        </Col>
        <Col xs={{ span: 2, offset: 6 }}>
          <Form.Select
              onChange={(e) => { handleGrouping(e.target.value); }}
              placeholder="Group rows by column"
              value={groupingColumn ? groupingColumn.toString() : 'none'} >
            <option value="none">Group rows by column</option>
            {initialData.columns.filter((colData) => colData.visible === true).map((option, index) =>
                <option key={index} value={option.id}>{option.title}</option>
            )}
          </Form.Select>
        </Col>
        <Col xs={2}>
          <Select
            multi
            className="rounded"
            dropdownHandle={false}
            options={initialData.columns}
            values={initialData.columns.filter((colData) => colData.visible === true)}
            labelField="title"
            valueField="id"
            contentRenderer={() => (
              <div>
                <b>
                  {initialData.columns.filter((colData) => colData.visible === true).length}
                  {' '} / {initialData.columns.length}
                </b>
                {' '}
                columns are visible
              </div>
            )}
            placeholder="Select visible columns"
            onChange={(values) => { handleVisibleColumns(values); }}
          />
        </Col>
      </Row>
      <Table striped className="table mt-4">
        <thead>
          <tr>
            <TableHeader
              columns={initialData.columns.filter((colData) => colData.visible === true)}
              sorting={sorting}
              handleSorting={handleSorting}
            />
          </tr>
        </thead>
        <tbody>
          {tableRowsData()}
        </tbody>
      </Table>
    </Container>
  );
}
