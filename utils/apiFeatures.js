class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString };

        const excludedFields = [
            "page",
            "limit",
            "sort",
            "fields"
        ];

        excludedFields.forEach(
            field => delete queryObj[field]
        );

        this.query = this.query.find(queryObj);

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