import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import type { ContentSection } from '@/lib/data/schemas';

export interface EditorialArticleProps {
  readonly sections: readonly ContentSection[];
}

/**
 * Renders the section structure used by guides and blog posts.
 *
 * Sections supply their own `h2`, so the document outline stays correct beneath
 * the page's single `h1` without the author having to manage heading levels in
 * JSON.
 */
export function EditorialArticle({ sections }: EditorialArticleProps) {
  if (sections.length === 0) return null;

  return (
    <div className="bg-white py-(--spacing-section)">
      <Container width="prose">
        <div className="space-y-12">
          {sections.map((section, index) => (
            <section key={`${section.heading}-${index}`}>
              <Heading level={2} className="text-xl sm:text-2xl">
                {section.heading}
              </Heading>

              <div className="mt-4 space-y-4">
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex} className="text-base leading-relaxed text-ink-700">
                    {paragraph}
                  </p>
                ))}
              </div>

              {section.bullets && section.bullets.length > 0 ? (
                <ul className="mt-5 space-y-2">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-base leading-relaxed text-ink-700">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600"
                      />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {section.callout ? (
                <p className="mt-5 border-l-2 border-brand-600 bg-brand-50/60 px-4 py-3 text-sm leading-relaxed text-brand-900">
                  {section.callout}
                </p>
              ) : null}

              {section.subsections?.map((subsection) => (
                <div key={subsection.heading} className="mt-8">
                  <Heading level={3} className="text-lg sm:text-xl">
                    {subsection.heading}
                  </Heading>
                  <div className="mt-3 space-y-4">
                    {subsection.paragraphs.map((paragraph, paragraphIndex) => (
                      <p key={paragraphIndex} className="text-base leading-relaxed text-ink-700">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {subsection.details?.map((detail) => (
                    <div key={detail.heading} className="mt-6">
                      <Heading level={4} className="text-base font-semibold">
                        {detail.heading}
                      </Heading>
                      <div className="mt-2 space-y-3">
                        {detail.paragraphs.map((paragraph, paragraphIndex) => (
                          <p key={paragraphIndex} className="text-base leading-relaxed text-ink-700">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </section>
          ))}
        </div>
      </Container>
    </div>
  );
}
