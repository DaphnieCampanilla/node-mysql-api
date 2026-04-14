import { expressjwt as jwt } from 'express-jwt';
import config from '../config.json';
import db from '../_helpers/db';

export default function authorize(roles: any = []) {
    if (typeof roles === 'string') {
        roles = [roles]; 
    }

    return [
        jwt({ secret: config.secret, algorithms: ['HS256'] }),

        async (req: any, res: any, next: any) => {
            // Added a check to make sure req.auth exists
            if (!req.auth) return res.status(401).json({ message: 'Unauthorized' });

            const account = await db.Account.findByPk(req.auth.id); 

            // Check if account exists and if the role is authorized
            if (!account || (roles.length && !roles.includes(account.role))) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // SUCCESS: Use '?' to safely access role and avoid the "undefined" error
            req.auth.role = account?.role; 
            
            const refreshTokens = await account.getRefreshTokens();
            req.auth.ownsToken = (token: any) => !!refreshTokens.find((x: any) => x.token === token);
            
            next(); 
        }
    ];
}