const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false
    });

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    req[source] = value;

    next();
  };
};

module.exports = validate;