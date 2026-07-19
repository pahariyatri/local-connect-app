/**
 * Community service — two separate spaces:
 *   - "traveler": the public traveller community on the website (open to logged-in travellers)
 *   - "vendor":   the host community inside the vendor dashboard (vendors only)
 *
 * Backed by an in-memory store so both feeds are fully interactive without a
 * backend. Every method is async and mirrors the eventual REST surface, so wiring
 * it to the real `/community/*` endpoints later is a drop-in swap (see the commented
 * apiClient calls). UI code should only ever import from here, never touch the store.
 */

export type AuthorRole = "traveler" | "vendor";
export type CommunitySpace = "traveler" | "vendor";

export interface CommunityAuthor {
  id: string;
  name: string;
  role: AuthorRole;
  verified?: boolean;
  location?: string;
}

export interface CommunityComment {
  id: string;
  author: CommunityAuthor;
  body: string;
  createdAt: string; // ISO
}

export interface CommunityPost {
  id: string;
  author: CommunityAuthor;
  body: string;
  image?: string;
  tags?: string[];
  likes: number;
  likedByMe: boolean;
  comments: CommunityComment[];
  createdAt: string; // ISO
}

// --- seed data -------------------------------------------------------------

const minsAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

const store: Record<CommunitySpace, CommunityPost[]> = {
  traveler: [
    {
      id: "t1",
      author: { id: "u_ananya", name: "Ananya Rao", role: "traveler", location: "Bengaluru" },
      body: "Just back from the Beas Kund trek. The silence above the treeline is something no photo captures. If you go, keep a full day at base camp to acclimatise, it makes the summit push so much kinder.",
      image: "https://images.unsplash.com/photo-1642498709557-b1bd711dd68b?q=80&w=800",
      tags: ["Trekking", "Manali"],
      likes: 42,
      likedByMe: false,
      comments: [
        {
          id: "tc1",
          author: { id: "u_meera", name: "Meera J.", role: "traveler", location: "Pune" },
          body: "Bookmarking this for spring. Did you need permits for the base camp stay?",
          createdAt: minsAgo(38),
        },
      ],
      createdAt: minsAgo(55),
    },
    {
      id: "t2",
      author: { id: "u_rahul", name: "Rahul K.", role: "traveler", location: "Delhi" },
      body: "Planned my whole Spiti loop on here in about ten minutes. Being able to drag stops around day by day made it feel like my trip, not a template. Kaza to Chandra Taal was the highlight.",
      tags: ["Spiti", "Roadtrip"],
      likes: 61,
      likedByMe: true,
      comments: [
        {
          id: "tc2",
          author: { id: "u_anita", name: "Anita S.", role: "traveler", location: "Mumbai" },
          body: "Saving this. How were the roads after Kibber this time of year?",
          createdAt: minsAgo(90),
        },
      ],
      createdAt: minsAgo(220),
    },
  ],
  vendor: [
    {
      id: "v1",
      author: { id: "v_himalayan", name: "Himalayan Stays", role: "vendor", verified: true, location: "Old Manali" },
      body: "Fellow hosts: winter bookings are picking up early this year. We started offering a free pickup from the bus stand and our conversion jumped noticeably. Small touches, big trust.",
      tags: ["Hosting", "Winter"],
      likes: 18,
      likedByMe: false,
      comments: [
        {
          id: "vc1",
          author: { id: "v_tenzing", name: "Tenzing Norgay Guides", role: "vendor", verified: true, location: "Manali" },
          body: "Same experience here. Clear communication before arrival cuts our cancellations by half.",
          createdAt: minsAgo(60),
        },
      ],
      createdAt: minsAgo(95),
    },
    {
      id: "v2",
      author: { id: "v_paragliding", name: "Solang Adventures", role: "vendor", verified: true, location: "Solang" },
      body: "Reminder to update your availability calendars before the long weekend. Travellers are planning further ahead now, and an accurate calendar means fewer refunds and better reviews.",
      tags: ["Operations", "Tips"],
      likes: 24,
      likedByMe: false,
      comments: [],
      createdAt: minsAgo(180),
    },
  ],
};

// --- helpers ---------------------------------------------------------------

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const delay = (ms = 260) => new Promise((r) => setTimeout(r, ms));
const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 9)}`;

/** Compact relative time, e.g. "just now", "38m", "3h", "2d". */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return `${Math.floor(d / 7)}w`;
}

// --- API -------------------------------------------------------------------

export async function getPosts(space: CommunitySpace): Promise<CommunityPost[]> {
  // try { return (await apiClient.get(`/community/${space}/posts`)).data; } catch {}
  await delay();
  const sorted = [...store[space]].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return clone(sorted);
}

export async function createPost(
  space: CommunitySpace,
  input: { body: string; author: CommunityAuthor; tags?: string[] }
): Promise<CommunityPost> {
  // try { return (await apiClient.post(`/community/${space}/posts`, input)).data; } catch {}
  await delay();
  const post: CommunityPost = {
    id: uid("p"),
    author: input.author,
    body: input.body.trim(),
    tags: input.tags,
    likes: 0,
    likedByMe: false,
    comments: [],
    createdAt: new Date().toISOString(),
  };
  store[space] = [post, ...store[space]];
  return clone(post);
}

export async function toggleLike(space: CommunitySpace, postId: string): Promise<CommunityPost> {
  // try { return (await apiClient.post(`/community/${space}/posts/${postId}/like`)).data; } catch {}
  await delay(120);
  const post = store[space].find((p) => p.id === postId);
  if (!post) throw new Error("Post not found");
  post.likedByMe = !post.likedByMe;
  post.likes += post.likedByMe ? 1 : -1;
  return clone(post);
}

export async function addComment(
  space: CommunitySpace,
  postId: string,
  input: { body: string; author: CommunityAuthor }
): Promise<CommunityComment> {
  // try { return (await apiClient.post(`/community/${space}/posts/${postId}/comments`, input)).data; } catch {}
  await delay(180);
  const post = store[space].find((p) => p.id === postId);
  if (!post) throw new Error("Post not found");
  const comment: CommunityComment = {
    id: uid("c"),
    author: input.author,
    body: input.body.trim(),
    createdAt: new Date().toISOString(),
  };
  post.comments = [...post.comments, comment];
  return clone(comment);
}
