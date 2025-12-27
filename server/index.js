import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { router } from './routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', router);

app.get('/', (req, res) => {
    res.send('Procurement Platform API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
