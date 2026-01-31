import mongoose from 'mongoose';
import connectToDatabase from './db.js';

// Define Schema
const MedicationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    time: { type: String, required: true },
    taken: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

// Prevent model recompilation error in serverless
const Medication = mongoose.models.Medication || mongoose.model('Medication', MedicationSchema);

export default async function handler(request, response) {
    const { method } = request;

    await connectToDatabase();

    switch (method) {
        case 'GET':
            try {
                const meds = await Medication.find({}).sort({ createdAt: -1 }); /* Newest first */
                response.status(200).json(meds);
            } catch (error) {
                response.status(400).json({ success: false });
            }
            break;

        case 'POST':
            try {
                const med = await Medication.create(request.body);
                response.status(201).json(med);
            } catch (error) {
                response.status(400).json({ success: false, error: error.message });
            }
            break;

        case 'PUT':
            try {
                const { id } = request.query; // api/medications?id=...
                if (!id) throw new Error("ID required");

                const med = await Medication.findByIdAndUpdate(
                    id,
                    request.body, // { taken: true/false }
                    { new: true, runValidators: true }
                );

                if (!med) return response.status(404).json({ success: false });
                response.status(200).json(med);
            } catch (error) {
                response.status(400).json({ success: false, error: error.message });
            }
            break;

        case 'DELETE':
            try {
                const { id } = request.query;
                if (!id) throw new Error("ID required");

                const deletedMed = await Medication.deleteOne({ _id: id });

                if (!deletedMed) {
                    return response.status(400).json({ success: false });
                }
                response.status(200).json({ success: true, data: {} });
            } catch (error) {
                response.status(400).json({ success: false });
            }
            break;

        default:
            response.status(400).json({ success: false });
            break;
    }
}
