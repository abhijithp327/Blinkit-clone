import AdminJs from 'adminjs';
import * as AdminJsMongoose from '@adminjs/mongoose';
import * as AdminJsFastify from '@adminjs/fastify';
import * as Models from '../models/index.js';
import { authenticate, COOKIE_PASSWORD, sessionStore } from './config.js';
import { dark, light, noSidebar } from "@adminjs/themes";


AdminJs.registerAdapter(AdminJsMongoose);


export const admin = new AdminJs({
    resources: [
        {
            resource: Models.Customer,
            options: {
                listProperties: ['name', 'phone', 'isActivated'],
                filterProperties: ['name', 'phone'],
            }
        },
        {
            resource: Models.DeliveryPartner,
            options: {
                listProperties: ['email', 'role', 'isActivated'],
                filterProperties: ['email', 'role'],
            }
        },
        {
            resource: Models.Admin,
            options: {
                listProperties: ['email', 'role', 'isActivated'],
                filterProperties: ['email', 'role'],
            }
        },
        { resource: Models.Branch },
        { resource: Models.Product },
        { resource: Models.Category },
        { resource: Models.Order },
        { resource: Models.Counter },
    ],
    branding: {
        companyName: "Blinkit",
        withMadeWithLove: false,
        favicon:
            "https://res.cloudinary.com/dponzgerb/image/upload/v1722852076/s32qztc3slzqukdletgj.png",
        logo: "https://res.cloudinary.com/dponzgerb/image/upload/v1722852076/s32qztc3slzqukdletgj.png",
    },
    defaultTheme: dark.id,
    availableThemes: [dark, light, noSidebar],
    rootPath: "/admin",
});




export const buildAdminRouter = async (app) => {
    await AdminJsFastify.buildAuthenticatedRouter(admin,
        {
            authenticate,
            cookiePassword: COOKIE_PASSWORD,
            cookieName: 'adminjs',
        },
        app,
        {
            store: sessionStore,
            saveUninitialized: true, // Set this to false
            secret: COOKIE_PASSWORD,
            cookie: {
                httpOnly: process.env.NODE_ENV === 'production',
                secure: process.env.NODE_ENV === 'production',
            },
        }
    );
};