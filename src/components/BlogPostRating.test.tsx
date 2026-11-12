import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BlogPostRating } from './BlogPostRating';

const mocks = vi.hoisted(() => ({ rpc: vi.fn(), insert: vi.fn(), from: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: mocks }));
vi.mock('@/contexts/LocaleContext', () => ({ useLocale: () => ({ language: 'en' }) }));
vi.mock('sonner', () => ({ toast: { info: vi.fn(), error: vi.fn(), success: vi.fn() } }));

describe('public blog rating privacy', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mocks.rpc.mockResolvedValue({ data: [{ average_stars: 4.5, rating_count: 2 }] });
    mocks.insert.mockResolvedValue({ error: null });
    mocks.from.mockReturnValue({ insert: mocks.insert });
  });

  it('loads only an aggregate summary without reading raw ratings', async () => {
    render(<BlogPostRating postId="post-1" />);
    await waitFor(() => expect(screen.getByText('4.5 of 5 · 2 ratings')).toBeInTheDocument());
    expect(mocks.rpc).toHaveBeenCalledWith('get_blog_rating_summary', { _post_id: 'post-1' });
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('remembers submission locally without fetching visitor identifiers', async () => {
    localStorage.setItem('blog_rating_submitted:post-1', 'true');
    render(<BlogPostRating postId="post-1" />);
    expect(await screen.findByText('Thanks for your rating!')).toBeInTheDocument();
    expect(mocks.from).not.toHaveBeenCalled();
  });
});