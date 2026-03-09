interface AnalysisAreasListProps {
  areas: string[];
}

export default function AnalysisAreasList({ areas }: AnalysisAreasListProps) {
  return (
    <ul className="grid sm:grid-cols-2 gap-2 text-neutral-600 text-sm">
      {areas.map((area) => (
        <li key={area} className="flex items-center gap-2">
          <span className="text-blue-600">✓</span> {area}
        </li>
      ))}
    </ul>
  );
}
