import { Source } from './types';

interface SourceCardProps {
  source: Source;
}

export default function SourceCard({ source }: SourceCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{source.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          <strong>URL:</strong>{" "}
          <a href={source.url} className="link link-primary">
            {source.url}
          </a>
        </p>
        <p>
          <strong>Status:</strong> {source.status}
        </p>
        <p>
          <strong>Article:</strong> {source.article.title}
        </p>
        <p>
          <strong>Submitter:</strong> {source.submitter.name}
        </p>
        {source.submitNote && (
          <p>
            <strong>Submit Note:</strong> {source.submitNote}
          </p>
        )}
      </CardContent>
    </Card>
  );
}