// Builds a Pexels CDN URL from a photo ID.
// Find a photo on pexels.com; the ID is the number at the end of its page URL.
export const pexels = (id: number, width = 1600) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
