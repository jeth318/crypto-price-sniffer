import dotenv from 'dotenv';
import path from 'path';
import { cwd } from 'process';
console.log(('CWD', path.join(cwd(), '.env')));
dotenv.config({ path: path.join(cwd(), '.env') });
