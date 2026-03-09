interface FaqItem {
  question: string;
  answer: string;
}

interface FaqListProps {
  items: FaqItem[];
}

export default function FaqList({ items }: FaqListProps) {
  return (
    <dl className="space-y-4">
      {items.map(({ question, answer }) => (
        <div key={question}>
          <dt className="font-medium text-neutral-900">{question}</dt>
          <dd className="text-neutral-600 text-sm mt-1">{answer}</dd>
        </div>
      ))}
    </dl>
  );
}
