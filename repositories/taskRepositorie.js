const Task = require("../models/Task");
const APIFeatures = require("../utils/apiFeatures");
const escapeRegex = require("../utils/escapeRegex");
const mongoose = require("mongoose");
class taskRepository {
    async create (data) {
        return await Task.create(data);
    };

 async findAll(userId, queryString) {

    const filter = {
        createdBy: userId
    };


    const features = new APIFeatures(
    Task.find(filter),
    queryString
    );

features
    .filter()
    .search()
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

    // aggregate 

  async getTaskStats(userId) {
    return await Task.aggregate([
        {
            $match: {
                createdBy: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: "$status",
                totalTasks: {
                    $sum: 1
                },
                averageHours: {
                    $avg: "$estimatedHours"
                },
                totalHours: {
                    $sum: "$estimatedHours"
                }
            }
        },
       
        
    ]);
 }

}

module.exports = new taskRepository();