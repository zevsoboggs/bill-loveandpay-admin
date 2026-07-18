import simpleRest from '@refinedev/simple-rest';
import { ADMIN_API } from './constants.js';
import { httpClient } from './httpClient.js';

// simple-rest speaks the exact query dialect the backend implements
// (_start/_end/_sort/_order + X-Total-Count). The shared httpClient adds auth.
export const dataProvider = simpleRest(ADMIN_API, httpClient);
