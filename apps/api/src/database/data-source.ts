import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { createTypeOrmOptions } from './typeorm-options.js';

export default new DataSource(createTypeOrmOptions());
