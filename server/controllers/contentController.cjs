const contentService = require('../services/contentService.cjs');

const getContent = async (req, res, next) => {
  try {
    const content = await contentService.getSiteContent();
    res.json(content);
  } catch (err) {
    next(err);
  }
};

const updateContent = async (req, res, next) => {
  try {
    const { value } = req.body;
    if (value === undefined) {
      return res.status(400).json({ error: 'value is required' });
    }
    const result = await contentService.updateSiteContent(req.params.section, req.params.key, value);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const bulkUpdateContent = async (req, res, next) => {
  try {
    const { fields } = req.body;
    if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
      return res.status(400).json({ error: 'fields object is required' });
    }
    const result = await contentService.bulkUpdateSection(req.params.section, fields);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getContent,
  updateContent,
  bulkUpdateContent,
};
