import repo from '@/db/repo';

export async function getSiteSetting(key: string, defaultValue: string): Promise<string> {
  try {
    return await repo.getSiteSetting(key, defaultValue);
  } catch (error) {
    console.error(`Error fetching site setting for key ${key}:`, error);
    return defaultValue;
  }
}

export async function getAllSiteSettings(): Promise<Record<string, string>> {
  try {
    const rows = await repo.getSiteSettings();
    const settings: Record<string, string> = {};
    rows.forEach(r => {
      settings[r.key] = r.value;
    });
    return settings;
  } catch (error) {
    console.error('Error fetching all site settings:', error);
    return {};
  }
}
