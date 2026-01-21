import { config } from 'dotenv'
import { DataSource } from 'typeorm'
import { TYPEORM_ENTITIES } from '@providers/database/entities'

config()

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: TYPEORM_ENTITIES,
  migrations: ['typeorm/migrations/*.ts'],
  synchronize: false,
})
