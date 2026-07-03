import { coreHttpClient } from "./http";

export const ImportExportService = {
  importPatients: async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await coreHttpClient.post("/import-export/csv/patients", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }
};
