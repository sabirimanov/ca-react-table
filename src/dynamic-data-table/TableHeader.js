import Button from "react-bootstrap/Button";
import React from "react";

export default function TableHeader({ columns, sorting, handleSorting }) {
    return columns.map((data) => (
        <th key={data.ordinalNo} width={data.width}>
            <Button
                className="px-0 text-decoration-none"
                variant="link"
                onClick={() => handleSorting(data.id)}
            >
                    {data.title}
                    {' '}
                    {sorting.column === data.id ? (sorting.direction === 'asc' ? '↑' : '↓') : ''}
            </Button>
        </th>
    ));
}
