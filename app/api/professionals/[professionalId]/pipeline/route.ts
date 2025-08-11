export async function GET(
  _req: Request,
  { params }: { params: { professionalId: string } }
) {
  const { professionalId } = params;
  const pipeline = {
    professionalId,
    stages: [
      { name: "Hot", opportunities: 3, amount: 28000, probability: 0.85 },
      { name: "Warm", opportunities: 5, amount: 17500, probability: 0.45 },
      { name: "Cold", opportunities: 7, amount: 22000, probability: 0.20 },
    ],
    nextActions: [
      { title: "Follow-up E-commerce Premium", dueInHours: 24 },
      { title: "Revisar proposta de Branding", dueInHours: 48 },
    ],
  };
  return new Response(JSON.stringify(pipeline), { headers: { "Content-Type": "application/json" } });
}



