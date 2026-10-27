class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

 filter() {
    // 🔒 SECURITY: Whitelist the only fields users are allowed to filter by.
    // Any other field, such as createdBy, password, or unexpected operators,
    // should not be accepted as a client-controlled filter.
    const allowedFilters = ["status", "priority", "estimatedHours"];
    const queryObj = {};

    // 🔁 Iterate over the allowed filter fields only.
    for (const key of allowedFilters) {
        if (this.queryString[key] !== undefined) {
            queryObj[key] = this.queryString[key];
        }
    }


    return this;
}

    search() {
        if (this.queryString.search) {

            const search = this.queryString.search;

            this.query = this.query.find({
                $or: [
                    {
                        title: {
                            $regex: search,
                            $options: "i"
                        }
                    },
                    {
                        description: {
                            $regex: search,
                            $options: "i"
                        }
                    }
                ]
            });
        }

        return this;
    }

    sort() {
        if (this.queryString.sort) {
            this.query = this.query.sort(
                this.queryString.sort
            );
        }

        return this;
    }

    limitFields() {
        if (this.queryString.fields) {

            const fields = this.queryString.fields
                .split(",")
                .join(" ");

            this.query = this.query.select(fields);
        }

        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;

        const skip = (page - 1) * limit;

        this.query = this.query
            .skip(skip)
            .limit(limit);

        return this;
    }
}

module.exports = APIFeatures;