import { DataTable, Column } from "../data-table";

interface SampleData {
  id: string;
  name: string;
  status: string;
  amount: string;
}

const sampleData: SampleData[] = [
  { id: "1", name: "Item 1", status: "Active", amount: "$1,000" },
  { id: "2", name: "Item 2", status: "Pending", amount: "$2,500" },
  { id: "3", name: "Item 3", status: "Completed", amount: "$3,750" },
];

const columns: Column<SampleData>[] = [
  { header: "Name", accessor: "name" },
  { header: "Status", accessor: "status" },
  { header: "Amount", accessor: "amount" },
];

export default function DataTableExample() {
  return (
    <div className="p-4 w-full max-w-3xl">
      <DataTable
        data={sampleData}
        columns={columns}
        currentPage={1}
        totalPages={3}
        onPageChange={(page) => console.log("Page:", page)}
      />
    </div>
  );
}
