export type EventThemeId = "halloween" | "christmas";

type EventThemeAssets = {
  homeHeroImage?: string;
};

export type EventThemeDefinition = {
  id: EventThemeId;
  activeMonths: number[];
  assets?: EventThemeAssets;
};

const EVENT_THEMES: EventThemeDefinition[] = [
  {
    id: "halloween",
    activeMonths: [9], // October
    assets: {
      homeHeroImage: "/Theme/Halloween/df0b3106-9895-4770-a55b-0d2d40a87104.png",
    },
  },
  {
    id: "christmas",
    activeMonths: [11], // November & December (for testing & actual season)
    assets: {},
  },
];

export function getActiveEventTheme(date: Date = new Date()): EventThemeDefinition | null {
  return EVENT_THEMES.find((theme) => theme.activeMonths.includes(date.getMonth())) ?? null;
}

export function isEventThemeActive(
  id: EventThemeId,
  date: Date = new Date(),
): boolean {
  return getActiveEventTheme(date)?.id === id;
}

export function getEventThemeAssets(id: EventThemeId): EventThemeAssets | undefined {
  return EVENT_THEMES.find((theme) => theme.id === id)?.assets;
}
