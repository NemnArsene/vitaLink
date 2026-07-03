import { coreHttpClient } from "./http";

export const ExportService = {
  csv: async (entity: string) => {
    const { data } = await coreHttpClient.post("/import-export/export/csv", { entity, format: "csv" }, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${entity}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
