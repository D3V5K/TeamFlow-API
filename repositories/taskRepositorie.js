const Task = require("../models/Task");
const APIFeatures = require("../utils/apiFeatures");
const escapeRegex = require("../utils/escapeRegex");
class taskRepository {
    async create (data) {
        return await Task.create(data);
    };

 async findAll(userId, queryString) {

    const filter = {
        createdBy: userId
    };

    // Filtering
    if (queryString.status) {
        filter.status = queryString.status;
    }

    // Search
    if (queryString.search) {
        const safeSearch = escapeRegex(queryString.search);

        filter.$or = [
            {
                title: {
                    $regex: safeSearch,
                    $options: "i"
                }
            },
            {
                description: {
                    $regex: safeSearch,
                    $options: "i"
                }
            }
        ];
    }

    const features = new APIFeatures(
        Task.find(filter),
        queryString
    );

    features
        .sort()
        .limitFields()
        .paginate();

    const [tasks, total] = await Promise.all([
        features.query,
        Task.countDocuments(filter)
    ]);

    return {
        tasks,
        total
    };
}

    async findById(id, userId) {
    return await Task.findOne({
        _id: id,
        createdBy: userId
    });
}


    async update(id, userId, data) {
    return await Task.findOneAndUpdate(
        {
            _id: id,
            createdBy: userId
        },
        data,
        {
            new: true,
            runValidators: true
        }
    );
    }

    async delete(id, userId) {
    return await Task.findOneAndDelete({
        _id: id,
        createdBy: userId
    });
    }

}

module.exports = new taskRepository();