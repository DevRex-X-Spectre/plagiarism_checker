export function validate(schema) {
  return (req, res, next) => {
    const data = { ...req.body, ...req.query, ...req.params };
    const result = schema.safeParse(data);

    if (!result.success) {
      const errors = result.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    req.validated = result.data;
    next();
  };
}
