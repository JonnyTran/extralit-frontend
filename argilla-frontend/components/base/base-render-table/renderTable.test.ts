// @ts-nocheck
import { shallowMount, Wrapper } from "@vue/test-utils";
import RenderTable from "./RenderTable.vue";
import { TableData } from "~/v1/domain/entities/table/TableData";
import { TabulatorFull as Tabulator } from "tabulator-tables";

interface RenderTableInstance extends Vue {
  tabulator: Tabulator;
  tableJSON: TableData;
  columns: string[];
  validateTable: (data: any) => boolean;
  clearTable: () => void;
  columnTitleChanged: (column: any) => Promise<void>;
  columnContextMenu: () => any[];
  rowContextMenu: () => any[];
  addRow: (position: any, data: any) => Promise<any>;
}


jest.mock("./useSchemaTableViewModel", () => ({
  useSchemaTableViewModel: () => ({
    fetchValidation: jest.fn().mockResolvedValue(undefined)
  })
}));

jest.mock("./useReferenceTablesViewModel", () => ({
  useReferenceTablesViewModel: () => ({
    referenceValues: { value: null },
    getTableDataFromRecords: jest.fn()
  })
}));

jest.mock("./useLLMExtractionViewModel", () => ({
  useLLMExtractionViewModel: () => ({
    completeExtraction: jest.fn().mockResolvedValue(undefined)
  })
}));

describe('RenderTable', () => {
  const createWrapper = (props = {}): Wrapper<RenderTableInstance> => {
    const mockTableData = new TableData({
      data: [
        { col1: "value1" },
        { col1: "value2" }
      ],
      schema: {
        primaryKey: ["col1"],
        fields: [{ name: "col1", type: "string" }]
      }
    });

    return shallowMount<RenderTableInstance>(RenderTable, {
      propsData: {
        tableJSON: mockTableData,
        editable: true,
        hasValidValues: true,
        questions: [],
        ...props
      },
      stubs: ['BaseButton', 'BaseDropdown', 'svgicon'],
      mocks: {
        $notification: {
          notify: jest.fn(),
          clear: jest.fn()
        }
      }
    });
  };

  describe('Basic Rendering', () => {
    it('renders with table data', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.table-container').exists()).toBe(true);
    });

    it('handles focus events', async () => {
      const wrapper = createWrapper();
      await wrapper.find('.table-container').trigger('focusin');
      expect(wrapper.emitted('on-change-focus')[0]).toEqual([true]);
    });
  });

  describe('Table Operations', () => {
    it('validates table data', () => {
      const wrapper = createWrapper();
      
      const result = wrapper.vm.validateTable({});
      expect(result).toBe(true);
      expect(wrapper.emitted('updateValidValues')[0]).toEqual([true]);
    });

    it('clears empty table', () => {
      const wrapper = createWrapper();

      wrapper.vm.clearTable();
      expect(wrapper.vm.tableJSON).toBeUndefined();
    });
  });

  describe('Column Operations', () => {
    it('prevents duplicate column names', async () => {
      const wrapper = createWrapper();
      wrapper.vm.columns = ['existingColumn'];
      
      const mockColumn = {
        getDefinition: () => ({
          title: 'existingColumn',
          field: 'oldField'
        })
      };

      await wrapper.vm.columnTitleChanged(mockColumn);
      expect(wrapper.vm.$notification.notify).toHaveBeenCalled();
    });

    it('provides column context menu options', () => {
      const wrapper = createWrapper();
      const menu = wrapper.vm.columnContextMenu();
      
      expect(menu).toContainEqual(expect.objectContaining({
        label: 'Add column ➡️',
        disabled: false
      }));
    });
  });

  describe('Row Operations', () => {
    it('provides row context menu options', () => {
      const wrapper = createWrapper();
      const menu = wrapper.vm.rowContextMenu();

      expect(menu).toContainEqual(expect.objectContaining({
        label: 'Add row below',
        disabled: false
      }));
    });

    it('adds new row with data', async () => {
      const wrapper = createWrapper();
      const rowData = { col1: 'test' };

      const addedRow = await wrapper.vm.addRow(null, rowData);

      expect(wrapper.vm.tabulator.addRow).toHaveBeenCalledWith(
        expect.objectContaining(rowData),
        false,
        undefined
      );
      expect(addedRow).toBeDefined();    });
  });
});