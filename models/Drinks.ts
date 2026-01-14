import mongoose from 'mongoose';

const DrinkSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	alcohol: {
		type: Number,
		required: true,
	},
	imageUrl: {
		type: String,
	},
	unitOfMeasurement: {
		type: String,
		required: true,
	},
});

export default mongoose.models.Drink || mongoose.model('Drink', DrinkSchema);
