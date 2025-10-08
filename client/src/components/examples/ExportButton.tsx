import { ExportButton } from "../export-button";

export default function ExportButtonExample() {
  return (
    <div className="p-4">
      <ExportButton
        onExportCSV={() => console.log("Export CSV")}
        onExportPDF={() => console.log("Export PDF")}
      />
    </div>
  );
}
