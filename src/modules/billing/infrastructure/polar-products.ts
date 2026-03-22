export const medicalProducts = [
  {
    productId: "f4b5210a-6677-4de4-a0ec-249d18079b43",
    id: "free",
    name: "Free Plan",
    description: "Para médicos independientes que quieren digitalizarse sin compromiso.",
    price: "Free",
    benefits: [
      "Pacientes activos 30",
      "Video llamada no incluida",
      "Historial medico basico",
      "Helsa AI assistant - no incluido",
    ],
  },
  {
    productId: "f36c67f6-4d6c-4522-b954-cd6c97b01be0",
    id: "basic",
    name: "Professional Plan",
    description: "Para clínicas pequeñas y médicos con volumen alto de pacientes.",
    price: "$49/month",
    benefits: [
      "Pacientes activos 300",
      "Video llamada 30 hrs/mes",
      "Historial medico con analisis avanzado",
      "Helsa AI assistant - incluido (modelos básicos)",
    ],
  },
  {
    productId: "e17755b0-0e97-41d9-a7fc-ad3ed0dd36ae",
    id: "complete",
    name: "Enterprise Plan",
    description: "Para clínicas y redes médicas con múltiples especialistas.",
    price: "$149/month",
    benefits: [
      "Pacientes activos ilimitados",
      "Video llamada ilimitada",
      "Transcripcion y grabación de video llamadas",
      "Historial medico completo con analisis avanzado",
      "Helsa AI assistant - incluido (modelos avanzados)",
    ],
  },
] as const;

export const patientProducts = [
  {
    productId: "8d6e4aff-2cce-44d4-9654-b9c16db046dc",
    id: "free",
    name: "Free Plan",
    description: "Para pacientes que quieren gestionar sus citas y salud de forma simple.",
    price: "Free",
    benefits: [
      "Citas agendables 5/mes",
      "Video llamada no incluida",
      "Historial medico basico (últimos 3 meses)",
      "Recordatorios de medicación",
      "Helsa AI assistant - no incluido",
      "Consultas de emergencia no incluida",
    ],
  },
  {
    productId: "14830bb3-ccdc-4689-bdd1-93fa418eeb53",
    id: "basic",
    name: "Health Plan",
    description: "Para pacientes crónicos o con seguimiento médico frecuente.",
    price: "$9/month",
    benefits: [
      "Citas agendables ilimitadas",
      "Video llamada incluida",
      "Historial medico histórico completo",
      "Recordatorios de medicación y seguimiento de síntomas",
      "Helsa AI assistant - incluido (modelos básicos)",
      "Consultas de emergencia no incluida",
    ],
  },
  {
    productId: "6639d605-dd5b-4185-99b8-4e59d7ff7c91",
    id: "complete",
    name: "Wellness Plan",
    description: "Para pacientes que buscan un enfoque integral de su salud y bienestar.",
    price: "$24/month",
    benefits: [
      "Citas agendables ilimitadas",
      "Video llamada incluida",
      "Historial medico completo con análisis de tendencias de salud",
      "Recordatorios personalizados de medicación, ejercicio y dieta",
      "Helsa AI assistant - incluido (modelos avanzados)",
      "Consultas de emergencia incluidas 24/7",
    ],
  },
];

export const clinicProducts = [
  {
    productId: "d1c9e5b8-3f2a-4e5b-9c1a-7f8e9d6a4b2c",
    id: "free",
    name: "Free Plan",
    description: "Para clínicas pequeñas que quieren probar la plataforma sin compromiso.",
    price: "Free",
    benefits: [
      "Usuarios activos 10",
      "Video llamada no incluida",
      "Historial medico basico",
      "Helsa AI assistant - no incluido",
    ],
  },
  {
    productId: "a2b3c4d5-e6f7-8901-2345-6789abcdef01",
    id: "basic",
    name: "Clinic Plan",
    description: "Para clínicas medianas que buscan mejorar la gestión de pacientes y citas.",
    price: "$99/month",
    benefits: [
      "Usuarios activos 100",
      "Video llamada 50 hrs/mes",
      "Historial medico con analisis avanzado",
      "Helsa AI assistant - incluido (modelos básicos)",
    ],
  },
  {
    productId: "12345678-90ab-cdef-1234-567890abcdef",
    id: "complete",
    name: "Hospital Plan",
    description: "Para hospitales y grandes redes médicas que necesitan una solución integral.",
    price: "$299/month",
    benefits: [
      "Usuarios activos ilimitados",
      "Video llamada ilimitada",
      "Transcripcion y grabación de video llamadas",
      "Historial medico completo con analisis avanzado",
      "Helsa AI assistant - incluido (modelos avanzados)",
    ],
  },
];

