import mongoose from 'mongoose';

const connectDB = async () => {
	const MONGO_URI = process.env.MONGO_URI;

	try {
		if (!MONGO_URI) {
			console.warn(
				'Missing MONGO_URI in environment. Skipping MongoDB connection (check your .env).'
			);
			return;
		}

		const conn = await mongoose.connect(MONGO_URI);
		if (conn) {
			console.log(`Database is connected: ${conn.connection.host}`);
		}
	} catch (error: any) {
		console.error('Database connection error:', error?.message ?? error);
	}
};

export default connectDB;
