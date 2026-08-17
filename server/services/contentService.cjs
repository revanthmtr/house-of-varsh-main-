const { queryAll, queryRun } = require('../config/db.cjs');

const getSiteContent = async () => {
  const rows = await queryAll('SELECT section, key, value, type FROM site_content');
  const result = {};
  rows.forEach(({ section, key, value, type }) => {
    if (!result[section]) result[section] = {};
    result[section][key] = { value, type };
  });
  return result;
};

const updateSiteContent = async (section, key, value) => {
  await queryRun(
    `INSERT INTO site_content (section, key, value, type, updated_at)
     VALUES (?, ?, ?, 'text', datetime('now'))
     ON CONFLICT(section, key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
    [section, key, value]
  );
  return { success: true, section, key, value };
};


// Bulk-update every field in a section in one call (used by the admin panel's
// "Save Section" button, which sends only the fields that actually changed).
const bulkUpdateSection = async (section, fields) => {
  const entries = Object.entries(fields || {});
  if (entries.length === 0) {
    throw { status: 400, message: 'No fields provided to update.' };
  }

  for (const [key, value] of entries) {
    await queryRun(
      `INSERT INTO site_content (section, key, value, type, updated_at)
       VALUES (?, ?, ?, 'text', datetime('now'))
       ON CONFLICT(section, key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
      [section, key, value]
    );
  }

  const rows = await queryAll('SELECT key, value, type FROM site_content WHERE section = ?', [section]);
  const updatedSection = {};
  rows.forEach(({ key, value, type }) => {
    updatedSection[key] = { value, type };
  });
  return updatedSection;
};

module.exports = {
  getSiteContent,
  updateSiteContent,
  bulkUpdateSection,
};
