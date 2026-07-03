import { coreHttpClient } from "./http";

export const MedicalRecordsService = {
  getByPatient: async (patientId: string) => {
    const { data } = await coreHttpClient.get(`/medical-records/${patientId}`);
    return data.data;
  },
  
  addAllergy: async (patientId: string, allergy: any) => {
    const { data } = await coreHttpClient.post(`/medical-records/${patientId}/allergies`, allergy);
    return data.data;
  },
  
  addCondition: async (patientId: string, condition: any) => {
    const { data } = await coreHttpClient.post(`/medical-records/${patientId}/conditions`, condition);
    return data.data;
  }
};
