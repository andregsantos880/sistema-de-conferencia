import React, { useState } from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/shared/ui/shadcn/components/ui/pagination';

const PaginationShowcasePage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(3);
  const totalPages = 10;

  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <ShowcasePage
      title="Pagination"
      description="Pagination components for navigating through pages of content."
    >
      <ShowcaseSection
        title="Basic Pagination"
        description="Simple pagination with previous/next buttons."
      >
        <CodeExample
          id="pagination"
          title="Simple Pagination"
          code={`<Pagination>
  <PaginationContent>
    <PaginationPrevious href="#" />
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">3</PaginationLink>
    </PaginationItem>
    <PaginationNext href="#" />
  </PaginationContent>
</Pagination>`}
        >
          <Pagination>
            <PaginationContent>
              <PaginationPrevious href="#" />
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">4</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">5</PaginationLink>
              </PaginationItem>
              <PaginationNext href="#" />
            </PaginationContent>
          </Pagination>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Pagination with Ellipsis"
        description="Use ellipsis for large page counts."
      >
        <CodeExample
          id="pagination"
          title="With Ellipsis"
          code={`<Pagination>
  <PaginationContent>
    <PaginationPrevious href="#" />
    <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
    <PaginationItem><PaginationEllipsis /></PaginationItem>
    <PaginationItem><PaginationLink href="#">4</PaginationLink></PaginationItem>
    <PaginationItem><PaginationLink href="#" isActive>5</PaginationLink></PaginationItem>
    <PaginationItem><PaginationLink href="#">6</PaginationLink></PaginationItem>
    <PaginationItem><PaginationEllipsis /></PaginationItem>
    <PaginationItem><PaginationLink href="#">10</PaginationLink></PaginationItem>
    <PaginationNext href="#" />
  </PaginationContent>
</Pagination>`}
        >
          <Pagination>
            <PaginationContent>
              <PaginationPrevious href="#" />
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">4</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>5</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">6</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">10</PaginationLink>
              </PaginationItem>
              <PaginationNext href="#" />
            </PaginationContent>
          </Pagination>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Interactive Pagination"
        description="Pagination with state management."
      >
        <CodeExample
          id="pagination"
          title="Controlled Pagination"
          code={`const [currentPage, setCurrentPage] = useState(3);

<Pagination>
  <PaginationContent>
    <PaginationPrevious 
      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
    />
    {pages.map((page) => (
      <PaginationItem key={page}>
        <PaginationLink 
          isActive={page === currentPage}
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </PaginationLink>
      </PaginationItem>
    ))}
    <PaginationNext 
      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
    />
  </PaginationContent>
</Pagination>`}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Page {currentPage} of {totalPages}
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((p) => Math.max(1, p - 1));
                  }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
                {getVisiblePages().map((page, idx) =>
                  page === 'ellipsis' ? (
                    <PaginationItem key={`ellipsis-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={page === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                  }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationContent>
            </Pagination>
          </div>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default PaginationShowcasePage;

