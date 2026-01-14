import mongoose from 'mongoose';

const ConsumptionsSchema = new mongoose.Schema({
	drinkId: {
		type: mongoose.Schema.Types.ObjectId,
		require: true,
	},
	user: {
		type: String,
		require: true,
		default: 'alma',
	},
	time: {
		type: Date,
		default: new Date(),
	},
	amount: {
		type: String,
		required: true,
	},
});

export default mongoose.models.Consumptions ||
	mongoose.model('Consumptions', ConsumptionsSchema);
