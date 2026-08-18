// ============================================================
// Static app content: filters, connection groups, events, care.
// The Learn feed (podcasts + blog) is generated separately into
// learn.js by scripts/sync-content.js from the live RSS feeds.
// ============================================================

export const learnFilters = [
  { id: 'all', label: 'All' },
  { id: 'podcast', label: 'Podcasts' },
  { id: 'blog', label: 'Blog' },
]

export const groups = [
  {
    title: 'Parent Connection Group',
    desc: 'A community for foster, adoptive, and relative caregiver families. Groups open with sharing, continue with curriculum, and close with discussion.',
    locations: ['Berkeley', 'Livermore', 'Los Altos', 'Los Gatos', 'Palo Alto', 'Redwood City', 'San Jose', 'San Francisco', 'Santa Rosa', 'Virtual'],
    action: 'join',
  },
  {
    title: 'Parents of Tweens & Teens (8–21)',
    desc: 'Connect with parents at a similar stage of the journey. Same trauma-informed, attachment-based format designed for parenting older kids.',
    locations: ['Multiple locations', 'Virtual'],
    action: 'join',
  },
  {
    title: 'Faith-Based Replanted Support Groups',
    desc: 'A year-long commitment to deepen fellowship using the Replanted Ministry curriculum with scripture as a guide.',
    link: 'https://www.replantedministry.org/about-replanted-groups',
    action: 'learn',
  },
]

export const careOptions = [
  { icon: '🙏', title: 'Submit a Prayer Request', sub: 'Let our community lift you up in prayer.', modal: 'prayer' },
  { icon: '🤝', title: 'Go to CarePortal', sub: 'Connect with local volunteers ready to support your family.', link: 'https://careportal.org' },
  { icon: '🎉', title: "Parents' Night Out", sub: 'A free night of respite while your kids have fun.', modal: 'pno' },
  { icon: '🏕️', title: 'Family Camp', sub: 'July 31–Aug 2 · Redwood Christian Park, Santa Cruz Mtns.', modal: 'camp' },
]
