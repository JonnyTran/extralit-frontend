import { DataFrame, PanderaSchema, Validator, Validators, ReferenceValues } from './types';
import { CellComponent, ColumnComponent, GroupComponent, RangeComponent, RowComponent } from "tabulator-tables";

type RecordDataFrames = Record<string, DataFrame>;
export type RecordDataFramesArray = RecordDataFrames[];


export function isTableJSON(value: string): boolean {
  if (!value?.length || (!value.startsWith('{') && !value.startsWith('['))) { return false; }
  
  try {
    JSON.parse(value);
    return true;
  } catch (e) {
    console.log(e)
    return false;
  }
}

export function cellTooltip(e, cell: CellComponent, onRendered) {
  var message = null;

  let errors = (cell as any)._cell?.modules?.validate?.invalid;

  if (cell.getValue()?.length > 100) {
    message = cell.getValue() + '\n\n';
  }

  if (errors?.length > 0) {
    message = errors.map(stringifyValidator).join(', ');
  }

  return message;
}



export function groupHeader(index: string, count: number, data: any, group: GroupComponent, referenceValues: ReferenceValues, refColumns: string[]) {
  const schema_ref = (group as any)._group.field
  let header = index
  let keyValues = '';
  if (referenceValues?.[schema_ref]?.hasOwnProperty(index)) {
    keyValues = Object.entries(referenceValues[schema_ref][index])
      // @ts-ignore
      .filter(([key, v]) => key !== "reference" && !refColumns?.includes(key) && v != null && v !== 'NA')
      .map(([key, v]) => `<span style="font-weight:normal; color:black; margin-left:0;">${key}:</span> ${v}`)
      .join(', ');
  }

  if (keyValues.length > 0) {
    header = `<small text="${index}">${keyValues}</small>`;
  } else {
    header = `<small style="color: red;">${index} (key not matched to ${schema_ref.replace(/_ref$/, '')})</small>`;
  }

  if (count > 1) header = header + `<small style='font-weight:normal; color:black; margin-left:10px;'>(${count})</small>`;
  return header;
}

export function headerTooltip(e, column: ColumnComponent, onRendered, validation: PanderaSchema, columnValidators: Validators) {
  try {
    const fieldName = column?.getDefinition()?.field;
    const desc = columnSchemaToDesc(fieldName, validation, columnValidators)

    if (!desc) return null;
    return desc;
  } catch (error) {
    console.log(error);
    console.log(error.stack);
  }
}

export function columnSchemaToDesc(
  fieldName: string, 
  validation: PanderaSchema, 
  columnValidators: Validators): string | undefined {
  // returns a string describing the column schema and validators
  if (!validation || !fieldName) return;
  
  var desc = `<b>${fieldName}</b>: ` || "";
  
  if (validation.columns.hasOwnProperty(fieldName)) {
    const column = validation.columns[fieldName];
    desc += column.description || "";
  } else if (validation.index.find((index) => index.name === fieldName)) {
    const index = validation.index.find((index) => index.name === fieldName);
    desc += index.description || "";
  }

  if (columnValidators.hasOwnProperty(fieldName)) {
    const criteriaSpecs = columnValidators[fieldName]
      .map(stringifyValidator)
      .filter((value) => value != null);
    desc += `<br/><br/>Checks: ${criteriaSpecs.join(', ')}`
      .replace(/,/g, ", ").replace(/:/g, ": ");
  }

  if (validation.columns[fieldName]?.checks?.multiselect?.delimiter) {
    desc += `, multivalues(delimiter="${validation.columns[fieldName]?.checks?.multiselect?.delimiter}")`
  }

  return desc;
}

function stringifyValidator(value: Validator): string | null {
  let s = null;

  if (typeof value === 'string') {
    s = value.replace('string', 'text');

  } else if (typeof value === 'function') {
    s = `${value.name}`.replace('nullable', 'optional');

  } else if (typeof value === 'object' && value?.type?.name) {
    s = `${value.type.name}`;
    if (value?.parameters != null && typeof value.parameters !== 'object') {
      s += `: ${value.parameters}`;
    } else if (!['integer', 'decimal'].includes(value?.type?.name) && value.parameters != null && typeof value.parameters === 'object') {
      const parameters = JSON.stringify(value.parameters)
        .replace(/[{""}]/g, '').replace(/:/g, '=').replace(/,/g, ', ')
        .replace('=true', '').replace('column=', '');
      s += `(${parameters})`;
    }

  } else if (typeof value === 'object' && typeof value?.type === 'string') {
    if (value.type === "function") {
      s = JSON.stringify(value.parameters)
        .replace(/[{""}]/g, '').replace(/:/g, '=').replace(/,/g, ', ')
        .replace('=true', '').replace('column=', '');;
    } else {
      s = `${value.type}`;

      if (value?.parameters != null && typeof value.parameters !== 'object') {
        s += `: ${value.parameters}`;
      }
    }
  }

  return s;
}

export function getRangeRowData(range: RangeComponent): Record<string, Record<string, any>> {
    const rangeData = range.getRows().reduce((acc, row: RowComponent) => {
        acc[row.getIndex()] = row.getData();
        return acc;
      }, {});

    return rangeData;
  };

export function getRangeColumns(range: RangeComponent): string[] {
  const columns = range.getColumns().map((col) => col.getField());
  return columns;
}