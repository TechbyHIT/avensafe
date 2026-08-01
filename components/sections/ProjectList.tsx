import Image from 'next/image';
import type { ImageRecord, Project } from '@/lib/data/schemas';

export interface ProjectEntry {
  readonly project: Project;
  readonly image: ImageRecord | undefined;
  readonly serviceNames: readonly string[];
}

export interface ProjectListProps {
  readonly entries: readonly ProjectEntry[];
}

/**
 * Installation scenarios.
 *
 * These describe representative job types rather than named client work, and the
 * `kind` field on each record says which it is. Nothing here claims to be a
 * specific customer's project unless it is marked as a verified case study.
 */
export function ProjectList({ entries }: ProjectListProps) {
  if (entries.length === 0) return null;

  return (
    <div className="space-y-14">
      {entries.map(({ project, image, serviceNames }) => (
        <article
          key={project.id}
          className="grid gap-8 border-t border-ink-200 pt-10 lg:grid-cols-[2fr_3fr]"
        >
          {image ? (
            <div className="overflow-hidden rounded-(--radius-card) border border-ink-200 bg-ink-100">
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading="lazy"
                sizes="(min-width: 1024px) 24rem, 100vw"
                className="h-auto w-full object-cover"
              />
            </div>
          ) : null}

          <div>
            <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase">
              {project.kind === 'scenario' ? 'Representative scenario' : 'Case study'} ·{' '}
              {project.propertyType}
            </p>
            <h3 className="mt-2 text-xl">{project.title}</h3>
            <p className="mt-3 text-base leading-relaxed text-ink-600">{project.brief}</p>

            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="font-semibold text-ink-900">The difficulty</dt>
                <dd className="mt-1 leading-relaxed text-ink-600">{project.challenge}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink-900">How we approach it</dt>
                <dd className="mt-1 leading-relaxed text-ink-600">{project.approach}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink-900">The result</dt>
                <dd className="mt-1 leading-relaxed text-ink-600">{project.outcome}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <p className="text-xs font-semibold tracking-wide text-ink-500 uppercase">
                Scope
              </p>
              <ul className="mt-2 space-y-1.5">
                {project.scopeItems.map((scopeItem) => (
                  <li key={scopeItem} className="flex gap-2 text-sm text-ink-600">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600"
                    />
                    <span>{scopeItem}</span>
                  </li>
                ))}
              </ul>
            </div>

            {serviceNames.length > 0 ? (
              <p className="mt-5 text-xs text-ink-500">Services: {serviceNames.join(', ')}</p>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
