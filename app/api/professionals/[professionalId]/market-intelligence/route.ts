export async function GET(
  _req: Request,
  { params }: { params: { professionalId: string } }
) {
  const { professionalId } = params;
  const data = {
    professionalId,
    opportunities: [
      { title: "Rebranding Corporativo", budget: 8500, hot: true },
      { title: "UI/UX App Fitness", budget: 4500, hot: false },
    ],
    trends: [
      { tag: "Motion Graphics", delta: 0.45 },
      { tag: "Logo Design", delta: 0.23 },
    ],
    competitors: [
      { name: "Ana Designer", rating: 4.8, avgPrice: 2200, projectsPerMonth: 12 },
      { name: "Carlos Creative", rating: 4.9, avgPrice: 3100, projectsPerMonth: 8 },
    ],
  };
  return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
}



