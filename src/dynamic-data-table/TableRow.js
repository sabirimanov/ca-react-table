import React from 'react';
import EditableCell from './EditableCell';

export default function TableRow({ data, visibleCols, sortingColumn, className, updateCellData }) {
    return (
      <tr key={data.id} className={className} id={`cr-id-${data.id}`}>
        {
                    visibleCols.map((columnData, index) => (
                      <td
                        className={columnData.id === sortingColumn ? 'bg-body-secondary' : ''}
                        key={index}
                        width={columnData.width}
                      >
                        <EditableCell
                          value={data[columnData.id]}
                          columnType={columnData.type}
                          onEdit={(newValue) => {
                            updateCellData(data.id, columnData, newValue);
                          }}
                        />
                      </td>
                    ))
                }
      </tr>
    );
}
