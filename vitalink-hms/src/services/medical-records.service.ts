import { coreHttpClient } from "./http";

// Les allergies et antécédents sont stockés directement sur le patient (string[]).
// Pas d'endpoint /medical-records séparé — on lit/écrit via /patients/:id.

export const MedicalRecordsService = {
  getByPatient: async (patientId: string) => {
    const { data } = await coreHttpClient.get(`/patients/${patientId}`);
    const p = data.data;
    return {
      id: p._id?.$oid || p.id || patientId,
      patientId,
      allergies: (p.allergies || []).map((a: string, i: number) => ({
        id: `allergen-${i}`,
        substance: a,
        severity: "MILD",
        reaction: "",
        notedAt: "",
      })),
      conditions: (p.antecedents || []).map((c: string, i: number) => ({
        id: `cond-${i}`,
        name: c,
        status: "ACTIVE",
        diagnosedAt: "",
        notes: "",
      })),
    };
  },

  addAllergy: async (patientId: string, allergy: any) => {
    // Récupérer les allergies existantes, ajouter la nouvelle, sauvegarder
    const { data } = await coreHttpClient.get(`/patients/${patientId}`);
    const p = data.data;
    const allergies = [...(p.allergies || []), allergy.substance || allergy];
    await coreHttpClient.put(`/patients/${patientId}`, { allergies });
    return { success: true };
  },

  addCondition: async (patientId: string, condition: any) => {
    const { data } = await coreHttpClient.get(`/patients/${patientId}`);
    const p = data.data;
    const antecedents = [...(p.antecedents || []), condition.name || condition];
    await coreHttpClient.put(`/patients/${patientId}`, { antecedents });
    return { success: true };
  },
};
