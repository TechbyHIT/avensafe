import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import type { ImageRecord } from '@/lib/data/schemas';
import type { ContentBlock, ContentModule } from '@/types/content';

/**
 * Renders the content engine's modules.
 *
 * One renderer for every generated page, so a change to how a spec table or a
 * step list looks happens in a single place rather than across hundreds of
 * routes. Headings are `h2` because the page supplies the only `h1`.
 */

function Block({ block }: { readonly block: ContentBlock }) {
  switch (block.type) {
    case 'prose':
      return (
        <div className="space-y-4">
          {block.paragraphs.map((paragraph, index) => (
            <p key={index} className="text-base leading-relaxed text-ink-700">
              {paragraph}
            </p>
          ))}
        </div>
      );

    case 'list':
      return (
        <ul className="mt-4 space-y-2">
          {block.items.map((item, index) => (
            <li key={index} className="flex gap-3 text-base leading-relaxed text-ink-700">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case 'definitions':
      return (
        <dl className="mt-4 grid gap-5 sm:grid-cols-2">
          {block.items.map((item) => (
            <div key={item.title} className="rounded-(--radius-card) border border-ink-200 p-5">
              <dt className="text-sm font-semibold text-ink-900">{item.title}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-600">{item.detail}</dd>
            </div>
          ))}
        </dl>
      );

    case 'steps':
      return (
        <ol className="mt-4 space-y-5">
          {block.items.map((item, index) => (
            <li key={item.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-semibold text-brand-800"
              >
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-600">{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      );

    case 'specs':
      return (
        <div className="mt-4 overflow-hidden rounded-(--radius-card) border border-ink-200">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Materials and specifications</caption>
            <thead className="bg-ink-50">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold text-ink-900">
                  Material
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-ink-900">
                  Specification
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-ink-900">
                  Why it matters
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200">
              {block.items.map((item) => (
                <tr key={item.name} className="align-top">
                  <th scope="row" className="px-4 py-3 font-medium text-ink-900">
                    {item.name}
                  </th>
                  <td className="px-4 py-3 text-ink-600">{item.spec}</td>
                  <td className="px-4 py-3 leading-relaxed text-ink-600">{item.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export interface ContentModulesProps {
  readonly modules: readonly ContentModule[];
  /** Optional photos interleaved into explain-style module layouts. */
  readonly images?: readonly ImageRecord[];
}

export function ContentModules({ modules, images = [] }: ContentModulesProps) {
  if (modules.length === 0) return null;

  return (
    <div id="page-content">
      {modules.map((entry, moduleIndex) => {
        const muted = moduleIndex % 2 === 1;
        const wide =
          entry.id === 'coverage' ||
          entry.id === 'features' ||
          entry.id === 'applications' ||
          entry.blocks.some((block) => block.type === 'definitions' || block.type === 'specs');
        const anchorId = `module-${entry.id}-${moduleIndex}`;
        // Every module gets a rotating photo when the page has images available.
        const sideImage =
          images.length > 0 ? images[moduleIndex % images.length] : undefined;
        const imageLeft = moduleIndex % 2 === 0;

        return (
          <div
            key={`${entry.id}-${moduleIndex}`}
            className={
              muted
                ? 'border-y border-ink-200 bg-ink-50 py-12 lg:py-16'
                : 'bg-surface-elevated py-12 lg:py-16'
            }
          >
            <Container width={sideImage || wide ? 'wide' : 'prose'}>
              <section aria-labelledby={anchorId}>
                {sideImage ? (
                  <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                    <div
                      className={
                        imageLeft
                          ? 'relative aspect-[4/3] overflow-hidden rounded-(--radius-media) bg-ink-200 shadow-(--shadow-card)'
                          : 'relative order-first aspect-[4/3] overflow-hidden rounded-(--radius-media) bg-ink-200 shadow-(--shadow-card) lg:order-last'
                      }
                    >
                      <Image
                        src={sideImage.src}
                        alt={sideImage.alt}
                        fill
                        sizes="(min-width: 1024px) 40vw, 100vw"
                        className="object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-widest text-accent-700 uppercase">
                        {entry.id.replace(/-/gu, ' ')}
                      </p>
                      <h2
                        id={anchorId}
                        className="mt-2 text-xl font-bold text-ink-900 sm:text-2xl lg:text-[1.75rem]"
                      >
                        {entry.heading}
                      </h2>
                      <div className="mt-5">
                        {entry.blocks.map((block, index) => (
                          <Block key={index} block={block} />
                        ))}
                      </div>
                      {entry.callout ? (
                        <p className="mt-6 border-l-4 border-accent-500 bg-brand-50 px-4 py-3.5 text-sm leading-relaxed text-ink-800">
                          {entry.callout}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-semibold tracking-widest text-accent-700 uppercase">
                      {entry.id.replace(/-/gu, ' ')}
                    </p>
                    <h2
                      id={anchorId}
                      className="mt-2 text-xl font-bold text-ink-900 sm:text-2xl lg:text-[1.75rem]"
                    >
                      {entry.heading}
                    </h2>
                    <div className="mt-5">
                      {entry.blocks.map((block, index) => (
                        <Block key={index} block={block} />
                      ))}
                    </div>
                    {entry.callout ? (
                      <p className="mt-6 border-l-4 border-accent-500 bg-brand-50 px-4 py-3.5 text-sm leading-relaxed text-ink-800">
                        {entry.callout}
                      </p>
                    ) : null}
                  </>
                )}
              </section>
            </Container>
          </div>
        );
      })}
    </div>
  );
}
