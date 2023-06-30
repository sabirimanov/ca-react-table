// noinspection JSValidateTypes

import React from 'react';
import Form from 'react-bootstrap/Form';
import { isObject } from 'lodash';
import {useEffect, useState, useRef} from "react";

export default function EditableCell({ value, columnType, onEdit }) {

  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);

  const onFocus = () => {
    setEditing(true);
  }

  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const onBlur = () => {
    setEditing(false);
  };


  let formattedData;
  let inputType;
  let selectOptions;
  let selectDefaultOption;
  switch (columnType) {
    case 'boolean':
      inputType = 'select';
      selectOptions = [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }];
      if (typeof value !== 'undefined') {
        selectDefaultOption = value.toString();
        formattedData = (value ? 'Yes' : 'No');
      }
      break;
    case 'select':
      inputType = 'select';
      selectOptions = value;
      if (typeof value !== 'undefined') {
        selectDefaultOption = formattedData = value[0];
      }
      break;
    case 'number':
      inputType = 'number';
      formattedData = value;
      break;
    default:
      inputType = 'text';
      formattedData = value;
  }

  let editElement;

  if (inputType === 'select' && selectOptions) {
    editElement = (
      <Form.Select
        ref={inputRef}
        style={{ width: '100%' }}
        onChange={(e) => { onEdit(e.target.value); onBlur(); }}
        onBlur={() => onBlur()}
        defaultValue={selectDefaultOption}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onBlur(); // noinspection JSUnresolvedVariable
            onEdit(e.target.value);
          } else if (e.key === 'Escape') { onBlur(); }
        }}
      >
        <option>Please, select value</option>
        {selectOptions.map((option, index) => {
          if (isObject(option)) {
            return <option key={index} value={option.value}>{option.label}</option>;
          }
          return <option key={index} value={option}>{option}</option>;
        })}
      </Form.Select>
    );
  } else {
    editElement = (
      <input
        type={inputType !== 'select' ? inputType : 'text'}
        style={{ width: '100%' }}
        ref={inputRef}
        defaultValue={value}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onBlur(); // noinspection JSUnresolvedVariable
            onEdit(e.target.value);
          } else if (e.key === 'Escape') { onBlur(); }
        }}
        onBlur={(e) => { onBlur(); onEdit(e.target.value); }}
      />
    );
  }

  return editing
    ? editElement
    : (
      <div onClick={() => onFocus()}>
        {formattedData}
        {' '}
        <span className="edit-cell" title="Click to edit">✎</span>
      </div>
  );
}
