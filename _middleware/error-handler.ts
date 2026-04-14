import { Request, Response, NextFunction } from 'express';

export default function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    switch (true) {
        case typeof err === 'string':
            // Custom app-specific errors 
            const is404 = err.toLowerCase().endsWith('not found'); 
            const statusCode = is404 ? 404 : 400; 
            return res.status(statusCode).json({ message: err }); 
        case err.name === 'UnauthorizedError':
            // JWT authentication error 
            return res.status(401).json({ message: 'Unauthorized' }); 
        default:
            // Standard server error 
            return res.status(500).json({ message: err.message }); 
    }
}